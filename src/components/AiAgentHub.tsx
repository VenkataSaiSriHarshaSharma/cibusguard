import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  UtensilsCrossed,
  ShieldCheck,
  Send,
  RefreshCw,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  ChefHat,
} from 'lucide-react';
import { FoodItem, AgentAudit, ZeroWasteRecipe } from '../types';

interface AiAgentHubProps {
  items: FoodItem[];
  onDonateCandidate: (itemName: string) => void;
  onExtendFreezerByName: (itemName: string) => void;
}

export const AiAgentHub: React.FC<AiAgentHubProps> = ({
  items,
  onDonateCandidate,
  onExtendFreezerByName,
}) => {
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<AgentAudit | null>(null);

  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [recipes, setRecipes] = useState<ZeroWasteRecipe[] | null>(null);

  const [userQuery, setUserQuery] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: 'Hello, I am CibusGuard, your autonomous Food Monitoring Agent. I continuously analyze shelf lives, prevent food spoilage, calculate greenhouse gas savings, and maintain strict adherence to UN SDG 12.3 and SDG 2. How can I assist your operations today?',
    },
  ]);

  // Run comprehensive inventory audit
  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await fetch('/api/agent/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Generate zero-waste recipes for items expiring soon
  const handleGenerateRecipes = async () => {
    setIsGeneratingRecipes(true);
    const expiringSoon = items.filter((i) => i.expiryDays <= 3 && i.status === 'available');

    try {
      const res = await fetch('/api/agent/recipe-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiringItems: expiringSoon.length > 0 ? expiringSoon : items.slice(0, 4),
        }),
      });
      const data = await res.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
      } else if (data.recipeName) {
        setRecipes([data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Chat query
  const handleSendQuery = async (queryText?: string) => {
    const text = queryText || userQuery;
    if (!text.trim()) return;

    const userMsg = text.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    if (!queryText) setUserQuery('');
    setIsSubmittingQuery(true);

    try {
      const res = await fetch('/api/agent/parse-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `The user asked this question to the CibusGuard Food Monitoring Agent: "${userMsg}". Current inventory summary: ${items
            .map((i) => `${i.name} (${i.quantity}${i.unit}, expires ${i.expiryDays}d)`)
            .join(', ')}. Answer concisely and provide concrete SDG 12.3, SDG 2, and culinary advice.`,
          source: 'agent_prompt',
        }),
      });

      const data = await res.json();
      const reply = data.message || `Under SDG 12.3 guidance, items with the shortest shelf-life must be rotated forward immediately. For your current inventory, prioritize utilizing ${items[0]?.name || 'urgent produce'} and store delicate greens at 2-4°C.`;

      setChatHistory((prev) => [...prev, { role: 'agent', text: reply }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          text: 'Under UN SDG Target 12.3, our primary priority is minimizing food loss through First-In-First-Out rotation. Keep dairy sealed at 2-4°C, freeze proteins before their best-by date, and dispatch remaining surplus to partner pantries.',
        },
      ]);
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Autonomous Food Monitoring Agent Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  GEMINI 3.8 ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Continuous spoilage prediction, culinary waste aversion, and automated UN SDG impact assessments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAudit}
              disabled={isRunningAudit}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRunningAudit ? 'Auditing Inventory...' : 'Run Inventory Audit'}</span>
            </button>

            <button
              onClick={handleGenerateRecipes}
              disabled={isGeneratingRecipes}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{isGeneratingRecipes ? 'Creating Recipes...' : 'Zero-Waste Recipes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Results View (if run) */}
      {auditResult && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Inventory Spoilage Audit & SDG Risk Report
              </h3>
            </div>
            <button
              onClick={() => setAuditResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-md text-xs text-slate-700 leading-relaxed border border-slate-100">
            {auditResult.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Urgent Actions */}
            <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Immediate Operational Directives</span>
              </div>
              <ul className="space-y-1.5 text-amber-900 list-disc list-inside">
                {(auditResult.urgentActionItems || [
                  'Rotate oldest seafood batches to prep line immediately.',
                  'Freeze perishable berries before cellular breakdown.',
                  'Stage surplus bread for croutons or donation pickup.',
                ]).map((action, idx) => (
                  <li key={idx} className="text-[11px] leading-snug">
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preservation Strategies */}
            <div className="border border-sky-200 bg-sky-50/50 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-sky-900 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-sky-600" />
                <span>Culinary Shelf-Life Extensions</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-sky-900">
                {(auditResult.preservationStrategies || [
                  { itemName: 'Fresh Strawberries', technique: 'Flash freeze on sheet pan then seal in bags', extendedShelfLife: '+90 days' },
                  { itemName: 'Artisan Bread', technique: 'Slice and bake into herb garlic croutons', extendedShelfLife: '+14 days' },
                ]).map((strat, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div>
                      <strong>{strat.itemName}:</strong> {strat.technique}
                    </div>
                    <span className="font-mono text-sky-700 font-semibold shrink-0 ml-2">
                      {strat.extendedShelfLife}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zero Waste Recipes View (if run) */}
      {recipes && recipes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chef's Zero-Waste Culinary Rescue Solutions
                </h3>
                <p className="text-xs text-slate-500">
                  Customized to utilize your current expiring inventory without scrap.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRecipes(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((rec, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rec.recipeName}</h4>
                    <div className="text-slate-500 mt-0.5">
                      Prep time: {rec.prepTime || '20 mins'} · Yield: {rec.servings || 4} servings
                    </div>
                  </div>
                </div>

                {rec.ingredientsUsed && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">
                      Target Expiring Items Used:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                      {rec.ingredientsUsed.map((ing, i) => (
                        <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.instructions && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">
                      Preparation Method:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                      {rec.instructions.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {rec.sdgBenefit && (
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] font-medium text-emerald-800">
                    🌱 {rec.sdgBenefit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Food Monitoring Agent Chat */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Ask the Food Monitoring Agent
        </h3>

        {/* Preset quick prompts */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() =>
              handleSendQuery(
                'Which food items in our current inventory have the highest risk of waste today?'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
          >
            "Highest spoilage risk today?"
          </button>
          <button
            onClick={() =>
              handleSendQuery(
                'How does our food monitoring process directly contribute to UN SDG Target 12.3?'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
          >
            "Explain our SDG 12.3 contribution"
          </button>
          <button
            onClick={() =>
              handleSendQuery(
                'What is the optimal HACCP cooling protocol for prepped hot soups and braises?'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
          >
            "HACCP cooling protocol"
          </button>
        </div>

        {/* Message Thread */}
        <div className="border border-slate-200 rounded-lg p-4 max-h-80 overflow-y-auto space-y-3 bg-slate-50/50">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-lg p-3 rounded-lg leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isSubmittingQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>CibusGuard Agent is reasoning...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about shelf lives, freezing advice, SDG calculations, or storage guidelines..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!userQuery.trim() || isSubmittingQuery}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
