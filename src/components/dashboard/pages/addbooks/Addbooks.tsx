import { CategoryShow } from "../allbooks/CategoryShow";
import { StyleHeader } from "./StyleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StyleContentManager from "../allbooks/StyleContentManager";
import { Layers, FileText, Database, Activity } from "lucide-react";

const Addbooks = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Category <span className="text-[#ff7a00]">Collections</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Manage your Collections categories and rich content modules for the
            storefront.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <Database size={14} className="text-[#ff7a00]" />
            <span className="text-xs font-bold text-slate-600">Categories</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 shadow-sm">
            <Activity size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="style-pages" className="w-full space-y-8">
        <TabsList className="inline-flex h-auto gap-2 bg-transparent p-0 border-none">
          <TabsTrigger
            value="style-pages"
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white data-[state=active]:bg-[#ff7a00] data-[state=active]:border-[#ff7a00] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff7a00]/20 transition-all duration-300 font-bold gap-2 text-slate-600 hover:border-[#ff7a00]/50"
          >
            <Layers className="w-4 h-4" />
            Collections Pages
          </TabsTrigger>
          <TabsTrigger
            value="style-contents"
            className="px-6 py-3 rounded-xl border border-slate-200 bg-white data-[state=active]:bg-[#ff7a00] data-[state=active]:border-[#ff7a00] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff7a00]/20 transition-all duration-300 font-bold gap-2 text-slate-600 hover:border-[#ff7a00]/50"
          >
            <FileText className="w-4 h-4" />
            Collections Contents
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="style-pages"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0"
        >
          <StyleHeader />
          <CategoryShow />
        </TabsContent>

        <TabsContent
          value="style-contents"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0"
        >
          <StyleContentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Addbooks;
