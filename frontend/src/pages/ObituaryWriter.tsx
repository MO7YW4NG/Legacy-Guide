import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Download, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  title: string;
}

const ObituaryWriter = () => {
  const [deceasedName, setDeceasedName] = useState("");
  const [deceasedAge, setDeceasedAge] = useState("");
  const [deathDate, setDeathDate] = useState<Date | undefined>(undefined);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    title: ""
  });
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedObituary, setGeneratedObituary] = useState("");

  const relationships = [
    "配偶", "長子", "次子", "三子", "長女", "次女", "三女",
    "媳婦", "女婿", "孫子", "孫女", "外孫", "外孫女",
    "兄", "弟", "姊", "妹", "父親", "母親"
  ];

  const titles = [
    "孝男", "孝女", "孝媳", "孝婿", "孝孫", "孝孫女",
    "孝外孫", "孝外孫女", "孝兄", "孝弟", "孝姊", "孝妹"
  ];

  const addFamilyMember = () => {
    if (newMember.name && newMember.relationship && newMember.title) {
      const member: FamilyMember = {
        id: Date.now().toString(),
        ...newMember
      };
      setFamilyMembers([...familyMembers, member]);
      setNewMember({ name: "", relationship: "", title: "" });
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  const generateObituary = () => {
    const familyList = familyMembers
      .map(member => `${member.title} ${member.name}`)
      .join("、");

    const formattedDate = deathDate ? format(deathDate, "yyyy年MM月dd日") : "";

    const obituary = `
先考 ${deceasedName} 先生（女士）

不幸於${formattedDate} 安詳辭世，享年 ${deceasedAge} 歲。

${additionalInfo ? `${additionalInfo}\n\n` : ''}先考一生秉持勤儉持家、克勤克儉之美德，對家庭盡心盡力，對子女諄諄教誨，為人和善，深受親友敬重。

謹訂於 ○年○月○日 舉行告別式，敬請親友蒞臨致祭。

${familyList ? `孝眷：${familyList} 等泣血稽顙` : ''}

此致
敬禮
    `.trim();

    setGeneratedObituary(obituary);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-light text-foreground mb-2">訃聞撰寫</h1>
        <p className="text-muted-foreground">輸入家屬資訊，自動生成適合的訃聞內容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：資料輸入 */}
        <div className="space-y-6">
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-light">基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deceased-name">往生者姓名</Label>
                  <Input
                    id="deceased-name"
                    value={deceasedName}
                    onChange={(e) => setDeceasedName(e.target.value)}
                    placeholder="請輸入姓名"
                  />
                </div>
                <div>
                  <Label htmlFor="deceased-age">享年</Label>
                  <Input
                    id="deceased-age"
                    value={deceasedAge}
                    onChange={(e) => setDeceasedAge(e.target.value)}
                    placeholder="歲數"
                  />
                </div>
              </div>
              <div>
                <Label>往生日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deathDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deathDate ? (
                        format(deathDate, "yyyy年MM月dd日")
                      ) : (
                        <span>請選擇日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deathDate}
                      onSelect={setDeathDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* 家屬資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-light">孝眷名單</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 新增家屬表單 */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label className="text-xs">姓名</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="姓名"
                    className="h-8"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">關係</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) => setNewMember({...newMember, relationship: value})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="關係" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((rel) => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">稱謂</Label>
                  <Select
                    value={newMember.title}
                    onValueChange={(value) => setNewMember({...newMember, title: value})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="稱謂" />
                    </SelectTrigger>
                    <SelectContent>
                      {titles.map((title) => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button onClick={addFamilyMember} size="sm" className="h-8">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 已新增的家屬列表 */}
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex gap-2">
                      <Badge variant="outline">{member.relationship}</Badge>
                      <span className="font-medium">{member.title} {member.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFamilyMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 額外資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-light">額外資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="additional-info">生平事蹟或特殊說明</Label>
              <Textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="可輸入往生者的生平事蹟、職業、興趣或其他想要提及的內容..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Button onClick={generateObituary} className="w-full bg-vi-dark hover:opacity-90">
            <FileText className="w-4 h-4 mr-2" />
            生成訃聞
          </Button>
        </div>

        {/* 右側：訃聞預覽 */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-light">訃聞預覽</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedObituary ? (
                <div className="space-y-4">
                  <div className="bg-white p-6 border rounded-lg shadow-sm min-h-96">
                    <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800">
                      {generatedObituary}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      下載PDF
                    </Button>
                    <Button className="flex-1 bg-vi-dark hover:opacity-90">
                      確認使用
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>請填寫左側資訊後生成訃聞</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObituaryWriter;
