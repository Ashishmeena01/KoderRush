import React, { useState } from "react";
import { api } from "@/lib/api";
import { MealItem } from "@/types/meal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Utensils,
  DollarSign,
  Clock,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface OwnerMealPricingConfigProps {
  meals: MealItem[];
  onMealsUpdated: () => void;
  hostelName?: string;
}

export const OwnerMealPricingConfig: React.FC<OwnerMealPricingConfigProps> = ({
  meals,
  onMealsUpdated,
  hostelName = "Managed Residence",
}) => {
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    price: number;
    timings: string;
    isAvailable: boolean;
    tokenGenerationDeadline: string;
    tokenRedemptionDeadline: string;
  }>({
    price: 50,
    timings: "",
    isAvailable: true,
    tokenGenerationDeadline: "",
    tokenRedemptionDeadline: "",
  });
  const [saving, setSaving] = useState<boolean>(false);

  const startEdit = (meal: MealItem) => {
    setEditingMealId(meal._id);
    setFormData({
      price: meal.price,
      timings: meal.timings,
      isAvailable: meal.isAvailable,
      tokenGenerationDeadline: meal.tokenGenerationDeadline || "09:00 AM",
      tokenRedemptionDeadline: meal.tokenRedemptionDeadline || "09:30 AM",
    });
  };

  const handleSave = async (mealId: string) => {
    try {
      setSaving(true);
      const res = await api.patch(`/meals/${mealId}`, formData);
      if (res.data.success) {
        toast.success("Meal pricing, timings & availability updated!");
        setEditingMealId(null);
        onMealsUpdated();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update meal config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Meal Pricing, Availability & Timings Configuration
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 mt-0.5">
            Set authoritative meal prices, collection windows, and generation deadlines for {hostelName}.
          </CardDescription>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] w-fit">
          SNAPSHOT PROTECTED
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 text-xs text-neutral-600 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Immutability Guarantee:</strong> Changing a price here updates future token issuances immediately while preserving original price snapshots for previously issued tokens.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meals.map((meal) => {
            const isEditing = editingMealId === meal._id;

            return (
              <div
                key={meal._id}
                className={`p-4 rounded-xl border transition-all ${
                  isEditing
                    ? "border-neutral-900 bg-neutral-50/50 shadow-md ring-1 ring-neutral-900"
                    : "border-neutral-200/90 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="capitalize text-xs font-semibold">
                    {meal.mealType}
                  </Badge>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`avail-${meal._id}`} className="text-[10px] font-medium text-neutral-600">
                        Active
                      </Label>
                      <Switch
                        id={`avail-${meal._id}`}
                        checked={formData.isAvailable}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, isAvailable: checked }))
                        }
                      />
                    </div>
                  ) : (
                    <Badge
                      className={`text-[10px] font-mono ${
                        meal.isAvailable
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      {meal.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                      Meal Menu
                    </span>
                    <p className="font-semibold text-neutral-900 text-xs line-clamp-2">
                      {meal.name}
                    </p>
                  </div>

                  {/* Price Setting */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                      Meal Price (INR)
                    </span>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-neutral-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))
                          }
                          className="pl-7 h-8 text-xs font-bold font-mono"
                        />
                      </div>
                    ) : (
                      <div className="text-xl font-black text-neutral-900 font-mono">
                        ₹{meal.price}
                      </div>
                    )}
                  </div>

                  {/* Timings */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                      Serving Window
                    </span>
                    {isEditing ? (
                      <Input
                        value={formData.timings}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            timings: e.target.value,
                          }))
                        }
                        placeholder="e.g. 07:30 AM - 09:30 AM"
                        className="h-8 text-xs font-mono"
                      />
                    ) : (
                      <div className="text-neutral-700 flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-neutral-400" />
                        {meal.timings}
                      </div>
                    )}
                  </div>

                  {/* Deadlines */}
                  {isEditing && (
                    <div className="space-y-2 pt-1 border-t border-neutral-200">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                          Generation Deadline
                        </span>
                        <Input
                          value={formData.tokenGenerationDeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tokenGenerationDeadline: e.target.value,
                            }))
                          }
                          placeholder="e.g. 09:00 AM"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                          Redemption Deadline
                        </span>
                        <Input
                          value={formData.tokenRedemptionDeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tokenRedemptionDeadline: e.target.value,
                            }))
                          }
                          placeholder="e.g. 09:30 AM"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={() => handleSave(meal._id)}
                          className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-8"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {saving ? "Saving..." : "Save Config"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMealId(null)}
                          className="text-xs h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(meal)}
                        className="w-full text-xs h-8 border-neutral-300 hover:bg-neutral-100"
                      >
                        Edit Pricing & Timings
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

