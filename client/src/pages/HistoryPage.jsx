import { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";

import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import TradeHistoryCard from "../components/TradeHistoryCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import tradeService from "../services/tradeService.js";
import { normalizeSetupQualityLabel } from "../utils/tradeLabels.js";

const filterInputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60";

export default function HistoryPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    result: "ALL",
    setupQuality: "ALL"
  });
  const { setUsage } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await tradeService.getTrades();
        if (isMounted) {
          setTrades(response.trades);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrades();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch = (trade.symbol || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const tradeResult = trade.result || trade.status;
      const matchesResult = filters.result === "ALL" || tradeResult === filters.result;
      const matchesSetup =
        filters.setupQuality === "ALL" ||
        normalizeSetupQualityLabel(trade.setupQuality) === filters.setupQuality;

      return matchesSearch && matchesResult && matchesSetup;
    });
  }, [trades, filters]);

  const handleDelete = async (tradeId) => {
    try {
      const response = await tradeService.deleteTrade(tradeId);
      if (response.usage) {
        setUsage(response.usage);
      }
      setTrades((current) => current.filter((trade) => trade.id !== tradeId));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Trade History</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Review your saved trade setups and outcomes</h1>
        <p className="mt-3 text-sm text-slate-400">
          Filter by symbol, outcome, or setup quality to revisit the exact context behind every trade.
        </p>
      </section>

      <ErrorMessage message={error} />

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-2xl lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <input
            className={`${filterInputClass} pl-10`}
            placeholder="Search by symbol"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
        </div>
        <select
          className={filterInputClass}
          value={filters.result}
          onChange={(event) => setFilters((current) => ({ ...current, result: event.target.value }))}
        >
          <option value="ALL">All Results</option>
          <option value="WIN">Win</option>
          <option value="LOSS">Loss</option>
          <option value="BREAKEVEN">Breakeven</option>
          <option value="OPEN">Open</option>
        </select>
        <select
          className={filterInputClass}
          value={filters.setupQuality}
          onChange={(event) =>
            setFilters((current) => ({ ...current, setupQuality: event.target.value }))
          }
        >
          <option value="ALL">All Setup Qualities</option>
          <option value="Weak Setup">Weak Setup</option>
          <option value="Moderate Setup">Moderate Setup</option>
          <option value="Strong Setup">Strong Setup</option>
          <option value="Elite Setup">Elite Setup</option>
        </select>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
          <LoadingSpinner label="Loading trade history..." />
        </div>
      ) : filteredTrades.length === 0 ? (
        <EmptyState
          icon={History}
          title="No trades saved yet"
          description="Start by completing your checklist."
        />
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade) => (
            <TradeHistoryCard key={trade.id} trade={trade} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
