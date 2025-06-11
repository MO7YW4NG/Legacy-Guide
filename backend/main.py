from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain.chains.retrieval import create_retrieval_chain
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAI
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.chains.combine_documents import create_stuff_documents_chain

load_dotenv()

app = FastAPI(title="LegacyGuide API")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        return {"response": "Hello, world!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Example 1: Simple in-memory RAG with HuggingFace Qwen embeddings
example_docs = [
    Document(page_content="LangChain is a framework for building context-aware reasoning applications.")
]
embeddings = HuggingFaceEmbeddings(model_name="Qwen/Qwen3-Embedding-0.6B")
vector_store = InMemoryVectorStore.from_documents(example_docs, embeddings)
retriever = vector_store.as_retriever()

# Example 2: RetrievalQA chain with Chroma vector store and Gemini LLM
# For demo, use a single document and split it
text = "LangChain enables retrieval augmented generation (RAG) workflows easily."
text_splitter = CharacterTextSplitter(chunk_size=50, chunk_overlap=0)
docs = text_splitter.split_documents([Document(page_content=text)])
llm = GoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# Modern RAG chain using LCEL (recommended approach)
# Compose: retrieve -> format context -> prompt -> Gemini LLM -> parse output
prompt = hub.pull("rlm/rag-prompt")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

llm = GoogleGenerativeAI(model="gemini-pro", temperature=0)
rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    }
    | prompt
    | llm
    | StrOutputParser()
)

# Set up the RAG chain using create_retrieval_chain (recommended modern approach)
retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
combine_docs_chain = create_stuff_documents_chain(llm, retrieval_qa_chat_prompt)
rag_chain = create_retrieval_chain(retriever, combine_docs_chain)

@app.post("/rag")
async def rag_endpoint(request: ChatRequest):
    try:
        # Use the RAG chain to answer the question
        answer = rag_chain.invoke({"input": request.message})
        return {"answer": answer["answer"] if isinstance(answer, dict) and "answer" in answer else answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 