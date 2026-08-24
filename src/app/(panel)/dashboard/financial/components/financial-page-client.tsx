"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MonthNavigator } from "./month-navigator"
import { OverviewTab } from "./overview-tab" 
import { LancamentosTab } from "./lancamentos-tab" 
import { AnalyticsTab } from "./analytics-tab" 
import { getFinancialOverview } from "../_data-access/get-financial-overview"
import { getFinancialTransactions } from "../_data-access/get-financial-transactions"
import { getFinancialAnalytics } from "../_data-access/get-financial-analytics"

type TabValue = "overview" | "lancamentos" | "analises"

export function FinancialPageClient() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [overviewData, setOverviewData] = useState<any>(null)
  const [transactionsData, setTransactionsData] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchActiveTabData = useCallback(async () => {
    setLoading(true)

    // Busca só o dado da aba ativa — evita 3 queries pesadas a cada troca de mês/aba
    if (activeTab === "overview") {
      const result = await getFinancialOverview(currentMonth)
      setOverviewData(result.data ?? null)
    } else if (activeTab === "lancamentos") {
      const result = await getFinancialTransactions({ month: currentMonth })
      setTransactionsData(result)
    } else if (activeTab === "analises") {
      const result = await getFinancialAnalytics(currentMonth)
      setAnalyticsData(result.data ?? null)
    }

    setLoading(false)
  }, [activeTab, currentMonth])

  useEffect(() => {
    fetchActiveTabData()
  }, [fetchActiveTabData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="overview" className="h-9 px-3">Visão Geral</TabsTrigger>
            <TabsTrigger value="lancamentos" className="h-9 px-3">Lançamentos</TabsTrigger>
            <TabsTrigger value="analises" className="h-9 px-3">Análises</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Comparativos usa período diferente (2 meses ao mesmo tempo), então o navegador único não se aplica lá */}
        {activeTab !== "analises" && (
          <MonthNavigator currentMonth={currentMonth} onChange={setCurrentMonth} />
        )}
      </div>

      {activeTab === "overview" && (
        <OverviewTab data={overviewData} loading={loading} onRefresh={fetchActiveTabData} />
      )}

      {activeTab === "lancamentos" && (
        <LancamentosTab
          data={transactionsData}
          loading={loading}
          onRefresh={fetchActiveTabData}
        />
      )}

      {activeTab === "analises" && (
        <AnalyticsTab data={analyticsData} loading={loading} referenceMonth={currentMonth} />
      )}
    </div>
  )
}