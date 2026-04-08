"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Countdown from "@/app/component/countdown";
import { useRouter } from "next/navigation";
import {
  MatchType1,
  MatchType2,
  MatchType3,
  MatchType4,
  MatchType5,
  MatchType6,
  MatchType7,
  MatchType8,
  MatchType9,
  MatchType10,
  MatchType1Img,
  MatchType2Img,
  MatchType3Img,
  MatchType4Img,
  MatchType5Img,
  MatchType6Img,
  MatchType7Img,
  MatchType8Img,
  MatchType9Img,
  MatchType10Img,
} from "@/config";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import ButtonLoading from "../buttonLoading";
import { showToast } from "./tostify";
import axios from "axios";
import RoomPopup from "./roomDetalpopup";
import PrizePopup from "./prizePopup";

const MATCH_TYPES = {
  MatchType1,
  MatchType2,
  MatchType3,
  MatchType4,
  MatchType5,
  MatchType6,
  MatchType7,
  MatchType8,
  MatchType9,
  MatchType10,
};

const MATCH_IMAGES = {
  MatchType1Img,
  MatchType2Img,
  MatchType3Img,
  MatchType4Img,
  MatchType5Img,
  MatchType6Img,
  MatchType7Img,
  MatchType8Img,
  MatchType9Img,
  MatchType10Img,
};

const getMatchImage = (matchType) => {
  const typeKey = Object.keys(MATCH_TYPES).find(
    (key) => MATCH_TYPES[key] === matchType,
  );
  const imageKey = typeKey?.replace("MatchType", "MatchType") + "Img";
  return MATCH_IMAGES[imageKey] || "/images/logo.jpg";
};

const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const PlayMatch = ({ type }) => {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [roomIdFor, setRoomIdFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const form = useForm({
    defaultValues: { roomId: "", roomPass: "", notification: "" },
  });

  useEffect(() => {
    if (!type) return;
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/matches?type=${encodeURIComponent(type)}`,
        );
        if (!res.ok) throw new Error("No matches found!");
        const data = await res.json();
        const filtered = (data?.data || [])
          .filter((m) => m.matchType === type)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setMatches(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [type]);

  const handleRoomIdSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/set-roomid", {
        data: { ...data, matchId: roomIdFor },
      });
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Failed to save");
      showToast("success", res.data.message || "Added successfully");

      const notifRes = await axios.post(`/api/roomId-notification`, {
        message: data.notification,
        matchId: roomIdFor,
      });
      if (notifRes?.data?.success)
        showToast("success", `${notifRes.data.sent} Device Notification sent!`);
      else showToast("error", "Notification failed!");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
      setRoomIdFor("");
      form.reset();
    }
  };

  const deleteMatch = async (matchId) => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `/api/matches/deleteMatch/?matchId=${matchId}`,
      );
      if (res.data.success) {
        showToast("success", res.data.message || "Match deleted");
        setMatches((prev) => prev.filter((m) => m._id !== matchId));
      } else throw new Error(res.data.message);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !roomIdFor && !confirmDelete)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  if (error || !type)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-extrabold">
          {error || "Something went wrong!"}
        </h1>
      </div>
    );
  if (!matches.length)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-800 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">No Matches Found</h1>
        <p className="text-lg">
          No matches available for <strong>{type}</strong>
        </p>
      </div>
    );

  return (
    <div className="space-y-4 bg-gray-400 min-h-screen p-4">
      <h1 className="text-center text-2xl text-fuchsia-50 font-bold mb-6">
        {type}
      </h1>

      {matches.map((match) => {
        const hasRoomId = match.roomId && match.roomPass;
        const progress = match.totalSpots
          ? (match.joinedPlayers.length / match.totalSpots) * 100
          : 0;

        return (
          <Card
            key={match._id}
            className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 transition cursor-pointer"
            // onClick={() => router.push(`/matches/details?matchId=${match._id}`)}
          >
            <CardHeader>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden relative">
                  <Image
                    src={getMatchImage(match.matchType)}
                    alt={match.matchType}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="flex flex-col justify-center gap-1">
                  <strong>{match.title}</strong>
                  <p className="text-sm text-gray-300">
                    {formatDate(match.startTime)}
                  </p>
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-around text-center">
                <div className="text-green-500 font-bold">
                  <strong>WIN PRIZE</strong>
                  <span className="block">{match.winPrize} TK</span>
                </div>
                <div className="text-blue-500 font-bold">
                  <strong>PER KILL</strong>
                  <span className="block">{match.perKill} TK</span>
                </div>
                <div className="text-red-500 font-bold">
                  <strong>ENTRY</strong>
                  <span className="block">{match.entryFee} TK</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-300 text-center text-sm">
                <div className="flex-1">
                  <strong>ENTRY TYPE</strong>
                  <p>{match.entryType}</p>
                </div>
                <div className="flex-1 border-x-4 border-amber-600">
                  <strong>MAP</strong>
                  <p>{match.map}</p>
                </div>
                <div className="flex-1">
                  <strong>VERSION</strong>
                  <p>MOBILE</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {match.totalSpots - match.joinedPlayers.length} left (
                    {match.joinedPlayers.length}/{match.totalSpots})
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    !hasRoomId
                      ? setRoomIdFor(match._id)
                      : showToast("success", "Room Id already saved");
                  }}
                  className={hasRoomId ? "bg-gray-500" : "bg-blue-600"}
                >
                  Set Room Id
                </Button>
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupData({
                      type: "room",
                      data: {
                        roomId: match.roomId,
                        roomPass: match.roomPass,
                        isJoined: hasRoomId,
                      },
                    });
                  }}
                  variant="outline"
                  className="border-gray-600 text-black flex-1"
                >
                  Room Details
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(match._id);
                  }}
                  variant="outline"
                  className="border-gray-600 bg-red-500 text-white flex-1"
                >
                  Delete
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupData({
                      type: "prize",
                      data: {
                        totalPrize: match.winPrize,
                        perKill: match.perKill,
                        allPrize: match.prizeDetails,
                      },
                    });
                  }}
                  variant="outline"
                  className="border-gray-600 text-black flex-1"
                >
                  Prize
                </Button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 p-2 bg-green-600 rounded text-center font-bold">
                  <Countdown targetDate={match.startTime} />
                </div>
                <div className="flex-1 p-2 bg-green-800 rounded text-center font-bold">
                  #{match.serialNumber}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {roomIdFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRoomIdSubmit)}
              className="space-y-4 w-full mx-6 bg-white p-4 border rounded"
            >
              {["roomId", "roomPass", "notification"].map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  rules={{ required: `${name} is required` }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{name}</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <ButtonLoading
                type="submit"
                className="w-full"
                text="Save"
                loading={loading}
              />
            </form>
          </Form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm deletion?
            </h2>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => deleteMatch(confirmDelete)}
              >
                Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {popupData?.type === "room" && (
        <RoomPopup {...popupData.data} onClose={() => setPopupData(null)} />
      )}
      {popupData?.type === "prize" && (
        <PrizePopup {...popupData.data} onClose={() => setPopupData(null)} />
      )}
    </div>
  );
};

export default PlayMatch;
