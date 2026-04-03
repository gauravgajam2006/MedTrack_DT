"use client";

import React, { useState, useMemo } from "react";
import { useAuth, useData } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pill,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  X,
  Edit3,
  Power,
  Search,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTime, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Medication } from "@/lib/types";

export default function MedicationsPage() {
  const { user } = useAuth();
  const { medications, refreshMedications } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const filteredMeds = useMemo(() => {
    if (!searchQuery.trim()) return medications;
    const q = searchQuery.toLowerCase();
    return medications.filter(
      (m) => m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q)
    );
  }, [medications, searchQuery]);

  const activeMeds = useMemo(
    () => filteredMeds.filter((m) => m.is_active),
    [filteredMeds]
  );
  const inactiveMeds = useMemo(
    () => filteredMeds.filter((m) => !m.is_active),
    [filteredMeds]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Medication deleted");
      refreshMedications();
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    const { error } = await supabase
      .from("medications")
      .update({ is_active: !currentlyActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(currentlyActive ? "Medication paused" : "Medication resumed");
      refreshMedications();
    }
  };

  const openEdit = (med: Medication) => {
    setEditingMed(med);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingMed(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Medications
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your medication schedule
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Medication</span>
        </motion.button>
      </div>

      {/* Search */}
      {medications.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Active ({activeMeds.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeMeds.map((med, i) => (
              <MedicationCard
                key={med.id}
                medication={med}
                index={i}
                onDelete={handleDelete}
                onToggle={toggleActive}
                onEdit={openEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Medications */}
      {inactiveMeds.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Paused ({inactiveMeds.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inactiveMeds.map((med, i) => (
              <MedicationCard
                key={med.id}
                medication={med}
                index={i}
                onDelete={handleDelete}
                onToggle={toggleActive}
                onEdit={openEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {medications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-12 text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Pill className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No medications added yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your medications by adding your first one. You&apos;ll get
            timely reminders and adherence reports.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAdd}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25"
          >
            Add Your First Medication
          </motion.button>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <MedicationModal
            medication={editingMed}
            onClose={() => {
              setShowModal(false);
              setEditingMed(null);
            }}
            onSave={() => {
              setShowModal(false);
              setEditingMed(null);
              refreshMedications();
            }}
            userId={user?.id || ""}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Medication Card ───────────────────────────────────────
function MedicationCard({
  medication,
  index,
  onDelete,
  onToggle,
  onEdit,
}: {
  medication: Medication;
  index: number;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (med: Medication) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl bg-card border border-border p-5 transition-shadow hover:shadow-lg",
        !medication.is_active && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{medication.name}</h3>
            <p className="text-xs text-muted-foreground">{medication.dosage}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(medication)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(medication.id, medication.is_active)}
            className={cn(
              "p-2 rounded-lg hover:bg-secondary transition-colors",
              medication.is_active
                ? "text-success hover:text-success"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {medication.times.map((t) => formatTime(t)).join(", ")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {format(parseISO(medication.start_date), "MMM d, yyyy")}
            {medication.end_date &&
              ` — ${format(parseISO(medication.end_date), "MMM d, yyyy")}`}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
            medication.frequency === "daily"
              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
              : medication.frequency === "weekly"
              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
              : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
          )}
        >
          {medication.frequency.charAt(0).toUpperCase() +
            medication.frequency.slice(1)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Add/Edit Modal ────────────────────────────────────────
function MedicationModal({
  medication,
  onClose,
  onSave,
  userId,
}: {
  medication: Medication | null;
  onClose: () => void;
  onSave: () => void;
  userId: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(medication?.name || "");
  const [dosage, setDosage] = useState(medication?.dosage || "");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    medication?.frequency || "daily"
  );
  const [times, setTimes] = useState<string[]>(
    medication?.times?.length ? medication.times : ["08:00"]
  );
  const [startDate, setStartDate] = useState(
    medication?.start_date || format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(medication?.end_date || "");

  const addTime = () => setTimes([...times, "12:00"]);
  const removeTime = (i: number) =>
    setTimes(times.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) =>
    setTimes(times.map((t, idx) => (idx === i ? val : t)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const data = {
      name,
      dosage,
      frequency,
      times,
      start_date: startDate,
      end_date: endDate || null,
    };

    console.log(`[MEDTRACK_DEBUG][MedicationModal] handleSubmit — mode=${medication ? "UPDATE" : "CREATE"}, userId=${userId}`);
    console.log("[MEDTRACK_DEBUG][MedicationModal] Payload:", JSON.stringify(data, null, 2));

    try {
      if (medication) {
        console.log(`[MEDTRACK_DEBUG][MedicationModal] Updating medication id=${medication.id}`);
        const { error } = await supabase
          .from("medications")
          .update(data)
          .eq("id", medication.id);
        if (error) {
          console.error("[MEDTRACK_DEBUG][MedicationModal] UPDATE FAILED:", error.message, "| code:", error.code, "| details:", error.details);
          toast.error(`Failed to update: ${error.message}`);
          return;
        }
        console.log("[MEDTRACK_DEBUG][MedicationModal] UPDATE SUCCESS");
        toast.success("Medication updated");
      } else {
        console.log("[MEDTRACK_DEBUG][MedicationModal] Inserting new medication...");
        const { data: inserted, error } = await supabase.from("medications").insert(data).select();
        if (error) {
          console.error("[MEDTRACK_DEBUG][MedicationModal] INSERT FAILED:", error.message, "| code:", error.code, "| details:", error.details);
          toast.error(`Failed to add: ${error.message}`);
          return;
        }
        console.log("[MEDTRACK_DEBUG][MedicationModal] INSERT SUCCESS:", inserted);
        toast.success("Medication added! 🎉");
      }
      console.log("[MEDTRACK_DEBUG][MedicationModal] Calling onSave() → will trigger refreshMedications()");
      onSave();
    } catch (err) {
      console.error("[MEDTRACK_DEBUG][MedicationModal] EXCEPTION:", err);
      toast.error("Failed to save medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-auto md:w-full md:max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {medication ? "Edit Medication" : "Add Medication"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Medication Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin"
              required
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dosage
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 100mg"
              required
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "custom"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all border",
                    frequency === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Time(s)
            </label>
            <div className="space-y-2">
              {times.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="text-sm text-primary hover:text-primary-light font-medium transition-colors"
              >
                + Add another time
              </button>
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all"
            >
              {loading
                ? "Saving..."
                : medication
                ? "Update"
                : "Add Medication"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
