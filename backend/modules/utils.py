import os
import logging
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, StorageContext, load_index_from_storage
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.text_embeddings_inference import TextEmbeddingsInference
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.core.postprocessor import LongContextReorder, SentenceEmbeddingOptimizer
from google.genai.types import GenerateContentConfig

# 設定日誌
logger = logging.getLogger(__name__)

# 全局變數來存儲共享的索引和引擎
_shared_index = None
_shared_embed_model = None
_shared_llm = None

_LCR = None
_SEO = None

# 持久化存儲路徑
PERSIST_DIR = "./storage"

def initialize_shared_components():
    """初始化共享組件（索引、嵌入模型、LLM）"""
    global _shared_index, _shared_embed_model, _shared_llm
    
    if _shared_index is not None:
        return _shared_index, _shared_embed_model, _shared_llm
    
    try:
        # 檢查是否需要重建索引 或 dir empty
        if not os.path.exists(PERSIST_DIR) or not os.listdir(PERSIST_DIR):
            logger.info("Building new index from documents...")
            
            # 使用 SimpleDirectoryReader 載入文件
            reader = SimpleDirectoryReader(input_dir="./assets/")
            example_docs = reader.load_data()
            
            if not example_docs:
                raise ValueError("No documents found in assets directory")

            # 初始化嵌入模型
            _shared_embed_model = TextEmbeddingsInference(
                model_name=os.getenv("EMBEDDING_MODEL_ID"),
                base_url="http://embeddings-inference:80",
                embed_batch_size=32
            )

            # 初始化 LLM
            _shared_llm = GoogleGenAI(
                model="gemini-2.5-flash",
                api_key=os.getenv("GEMINI_API_KEY")
            )
            
            Settings.embed_model = _shared_embed_model
            Settings.llm = _shared_llm
            Settings.chunk_size = 1024  # 使用較大的分塊大小
            Settings.chunk_overlap = 100  # 使用較大的重疊

            # 建立向量索引
            _shared_index = VectorStoreIndex.from_documents(
                example_docs,
                show_progress=True
            )
            
            # 保存索引到本地存儲
            os.makedirs(PERSIST_DIR, exist_ok=True)
            _shared_index.storage_context.persist(persist_dir=PERSIST_DIR)
            
            logger.info("New index built and saved successfully")
        else:
            logger.info("Loading existing index from storage...")
            
            # 初始化嵌入模型（用於加載索引）
            _shared_embed_model = TextEmbeddingsInference(
                model_name=os.getenv("EMBEDDING_MODEL_ID"),
                base_url="http://embeddings-inference:80",
                embed_batch_size=32
            )

            # 初始化 LLM
            _shared_llm = GoogleGenAI(
                model="gemini-2.5-flash",
                api_key=os.getenv("GEMINI_API_KEY")
            )
            
            Settings.embed_model = _shared_embed_model
            Settings.llm = _shared_llm
            
            # 從本地存儲加載索引
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            _shared_index = load_index_from_storage(storage_context)
            
            logger.info("Existing index loaded successfully")
        
        _LCR = LongContextReorder()
        _SEO = SentenceEmbeddingOptimizer(embed_model=Settings.embed_model, percentile_cutoff=0.7)
        
        return _shared_index, _shared_embed_model, _shared_llm

    except Exception as e:
        logger.error(f"Error initializing shared components: {str(e)}")
        raise

def create_rag_engine(
    system_prompt: str,
    temperature: float = 0.8,
    max_output_tokens: int = None
):
    """
    基於共享組件創建 RAG 引擎
    
    Args:
        system_prompt: 系統提示詞
        temperature: 生成溫度 (0.0-1.0)
        max_output_tokens: 最大輸出 token 數
    """
    try:
        # 獲取共享組件
        index, embed_model, base_llm = initialize_shared_components()
        
        # 創建具有特定配置的 LLM
        llm = GoogleGenAI(
            model="gemini-2.5-flash",
            api_key=os.getenv("GEMINI_API_KEY"),
            generation_config=GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens
            )
        )
        # 建立聊天引擎
        query_engine = index.as_chat_engine(
            llm=llm,
            chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT,
            system_prompt=system_prompt,
            postprocessors=[_LCR, _SEO]
        )

        return query_engine

    except Exception as e:
        logger.error(f"Error creating RAG engine: {str(e)}")
        raise

# 保持向後兼容性
def initialize_rag_engine(
    system_prompt: str,
    temperature: float = 0.8,
    max_output_tokens: int = 1024,
    chunk_size: int = 512,
    chunk_overlap: int = 50,
    model: str = "gemini-2.5-flash-preview-05-20"
):
    """
    向後兼容的函數，現在使用共享組件
    """
    return create_rag_engine(system_prompt, temperature, max_output_tokens)
