"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/app/component/application/tostify";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import ButtonLoading from "@/app/component/buttonLoading";

export default function TournamentForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const form = useForm({
    defaultValues: {
      title: "",
      startTime: "",
      winPrize: 405,
      perKill: 5,
      entryFee: 10,
      entryType: "Solo",
      map: "Bermuda",
      totalSpots: 48,
      prizeDetails: [""], // ✅ FIX: must be array with initial value
    },
  });

  // ADD PRIZE
  const addPrizeInput = () => {
    const current = form.getValues("prizeDetails") || [];

    if (current.length < 20) {
      form.setValue("prizeDetails", [...current, ""]);
    }
  };

  // REMOVE PRIZE
  const removePrizeInput = (index) => {
    const current = form.getValues("prizeDetails") || [];

    if (current.length > 1) {
      current.splice(index, 1);
      form.setValue("prizeDetails", [...current]);
    }
  };

  // SUBMIT
  const onSubmit = async (data) => {
    setLoading(true);

    const matchType = searchParams.get("type");
    data.matchType = matchType;

    data.startTime = new Date(data.startTime);

    // FIX: clean numbers
    data.prizeDetails = (data.prizeDetails || [])
      .map(Number)
      .filter((n) => !isNaN(n));

    try {
      const res = await axios.post("/api/addMatch", { data });

      if (res?.data?.success) {
        showToast("success", "Added successfully");
      } else {
        showToast("error", res?.data?.message || "Something went wrong");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg mx-auto p-4 border rounded"
      >
        {/* TITLE */}
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter tournament title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DATE TIME */}
        <FormField
          control={form.control}
          name="startTime"
          rules={{ required: "Date & Time is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* WIN PRIZE */}
        <FormField
          control={form.control}
          name="winPrize"
          rules={{ required: "Win Prize is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Win Prize</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PRIZE DETAILS */}
        <div className="flex flex-col gap-3 border bg-black/5 p-3 rounded">
          {form.watch("prizeDetails")?.map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`prizeDetails.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {index + 1}
                    {index === 0
                      ? "st"
                      : index === 1
                        ? "nd"
                        : index === 2
                          ? "rd"
                          : "th"}{" "}
                    Prize
                  </FormLabel>

                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>

                    {form.watch("prizeDetails").length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removePrizeInput(index)}
                      >
                        -
                      </Button>
                    )}
                  </div>

                  {form.watch("prizeDetails").length < 20 &&
                    index === form.watch("prizeDetails").length - 1 && (
                      <Button
                        type="button"
                        className="w-full mt-2"
                        onClick={addPrizeInput}
                      >
                        + Add
                      </Button>
                    )}
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* PER KILL */}
        <FormField
          control={form.control}
          name="perKill"
          rules={{ required: "Per Kill is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Per Kill</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ENTRY FEE */}
        <FormField
          control={form.control}
          name="entryFee"
          rules={{ required: "Entry Fee is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Fee</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ENTRY TYPE */}
        <FormField
          control={form.control}
          name="entryType"
          rules={{ required: "Entry Type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Duo">Duo</SelectItem>
                  <SelectItem value="Squad">Squad</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* MAP */}
        <FormField
          control={form.control}
          name="map"
          rules={{ required: "Map is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bermuda">Bermuda</SelectItem>
                  <SelectItem value="Bermuda 2.0">Bermuda 2.0</SelectItem>
                  <SelectItem value="Lone Wolf">Lone Wolf</SelectItem>
                  <SelectItem value="Kalahari">Kalahari</SelectItem>
                  <SelectItem value="Purgatory">Purgatory</SelectItem>
                  <SelectItem value="Alpine">Alpine</SelectItem>
                  <SelectItem value="NeXTerra">NeXTerra</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* TOTAL SPOTS */}
        <FormField
          control={form.control}
          name="totalSpots"
          rules={{ required: "Total Spots is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Spots</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* SUBMIT */}
        <ButtonLoading
          type="submit"
          className="w-full mt-4"
          text="Save Tournament"
          loading={loading}
        />
      </form>
    </Form>
  );
}
