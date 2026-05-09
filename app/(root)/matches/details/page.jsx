"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonLoading from "@/app/component/buttonLoading";
import { showToast } from "@/app/component/application/tostify";
import { Preferences } from "@capacitor/preferences";

export default function MatchDetails() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [draftFormData, setDraftFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [openUserRow, setOpenUserRow] = useState(null);

  // ✅ total winning calculation
  const totalWinning = useMemo(() => {
    return players.reduce((sum, p) => sum + (Number(p.wining) || 0), 0);
  }, [players]);

  useEffect(() => {
    if (!matchId) return;

    const fetchData = async () => {
      try {
        setFetching(true);

        const res = await axios.get(`/api/matches/details/?matchId=${matchId}`);

        setMatch(res?.data?.match);
        setPlayers(res?.data?.match.joinedPlayers || []);

        setMatchFound(res?.data?.match.joinedPlayers.length > 0 ? true : false);
      } catch (err) {
        console.error("Fetch error:", err);
        showToast("error", "Failed to load match data");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [matchId]);

  useEffect(() => {
    const draftForm = async () => {
      try {
        const { value } = await Preferences.get({
          key: "formDraft",
        });

        const draftData = JSON.parse(value);
        setDraftFormData(draftData || []);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    draftForm();
  }, []);

  // ✅ Input handler with strict validation
  const handleInputChange = async (playerIndex, authId, field, inputValue) => {
    // Convert input to number
    let val = Number(inputValue);

    // Prevent negative values
    if (isNaN(val) || val < 0) {
      val = 0;
    }

    // Clone players array safely
    const updatedPlayers = [...players];

    // Store previous value for rollback
    const previousValue = updatedPlayers[playerIndex][field] || 0;

    // Update current field
    updatedPlayers[playerIndex][field] = val;

    // Calculate total winning amount
    const totalWinning = updatedPlayers.reduce(
      (sum, player) => sum + (Number(player.wining) || 0),
      0,
    );

    // Validate against prize limit
    if (match?.winPrize && totalWinning > Number(match.winPrize)) {
      showToast("error", "Total winning exceeds prize limit!");

      // Rollback change
      updatedPlayers[playerIndex][field] = previousValue;

      setInputError(true);
      setPlayers(updatedPlayers);

      return;
    }

    setInputError(false);

    // Update UI state immediately
    setPlayers(updatedPlayers);

    try {
      // Get existing draft data

      const draftData = draftFormData || [];

      // Find existing player draft
      const existingIndex = draftData.findIndex(
        (item) => item.authId === authId,
      );

      if (existingIndex !== -1) {
        // Update existing entry
        draftData[existingIndex] = {
          ...draftData[existingIndex],
          [field]: val,
        };
      } else {
        // Create new entry

        draftData.push({
          matchId,
          authId,
          kills: field === "kills" ? val : 0,
          wining: field === "wining" ? val : 0,
        });
      }

      // Save updated draft
      await Preferences.set({
        key: "formDraft",
        value: JSON.stringify(draftData),
      });

      console.log("Draft saved:", draftData);
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const dropUser = (id) => {
    setOpenUserRow(openUserRow === id ? null : id);
  };

  const getValueFromDraft = (authId, field, value) => {
    const draftEntry = draftFormData.find(
      (entry) => entry.authId === authId && entry.matchId === matchId,
    );
    if (!draftEntry) return value;
    if (field === "kills") return draftEntry.kills || value;
    if (field === "wining") return draftEntry.wining || value;

    return value;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (totalWinning > match.winPrize) {
        showToast("error", "Winning exceeds total prize!");
        return;
      }

      const results = players.map((player) => ({
        playerId: player.authId,
        kills: Number(player.kills) || 0,
        winning: Number(player.wining) || 0,
      }));

      const res = await axios.post(`/api/matches/updateResults`, {
        matchId,
        results,
      });

      if (res?.data?.success) {
        // Clear draft data
        await Preferences.set({
          key: "formDraft",
          value: JSON.stringify([]),
        });
        showToast("success", "Results saved successfully!");
        router.back();
      } else {
        showToast("error", res?.data?.message || "Failed to save results");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", "Server error! Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = (query) => {
    if (!query) {
      setPlayers(match.joinedPlayers || []);
      return;
    }
    const filtered = (match.joinedPlayers || []).filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );
    setPlayers(filtered);
  };

  const deletSingleUser = async (playerId) => {
    try {
      setLoading(true);
      const res = await axios.post(`/api/matches/removePlayer`, {
        matchId,
        playerId,
      });

      if (res?.data?.success) {
        showToast("success", "Player removed successfully!");
        // Update local state to reflect change
        const updatedPlayers = players.filter((p) => p._id !== playerId);
        setPlayers(updatedPlayers);
      } else {
        showToast("error", res?.data?.message || "Failed to remove player");
      }
    } catch (err) {
      console.error("Remove error:", err);
      showToast("error", "Server error! Try again.");
    } finally {
      setLoading(false);
    }
  };
  // ✅ Loading state
  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading match...
      </div>
    );
  }

  // ✅ Not found state
  if (!match) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Match not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0620] text-white px-4 py-6">
      <div className="flex items-center justify-between">
        <div className=" w-2/4 text-left">
          <p className="text-xl text-green-500 font-bold ">{match.title}</p>
          <p className="text-md text-gray-400 mt-1">
            Prize Pool: {match.winPrize}
          </p>
        </div>
        <div className=" w-2/4 text-right">
          <p className="w-full text-md font-bold">EntryFee: {match.entryFee}</p>
          <p className="text-xl text-gray-300 mt-1">
            Per Kill: {match.perKill}
          </p>
        </div>
      </div>

      {/* Players List */}
      <div className="mt-8 border-t border-gray-700 pt-4">
        <h3 className="font-bold text-lg mb-3 text-center">Joined Players</h3>

        {matchFound ? (
          <>
            {inputError && (
              <p className="text-sm text-red-500 mb-4 text-center">
                Total winning exceeds prize limit!
              </p>
            )}
            <div className="p-2 flex justify-between gap-3 w-full text-gray-300 text-sm font-semibold rounded-tl-lg rounded-tr-lg">
              <input
                onChange={(e) => handleUserSearch(e.target.value)}
                type="text"
                placeholder="Search by username"
                className=" bg-transparent border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Total */}
              <p className="text-right mt-2 text-sm text-gray-400">
                Total Winning: {totalWinning}
              </p>
            </div>
            <div className="max-h-screen overflow-y-auto bg-gray-900 rounded-lg border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-600 text-green-300 text-left  ">
                    <th className="p-2 ">#</th>
                    <th className="p-2 ">Player</th>
                    <th className="p-2 ">Username</th>
                    <th className="p-2 ">Result</th>
                  </tr>
                </thead>
                <tbody className="transition-all duration-300">
                  {players.map((player, index) => (
                    <React.Fragment key={player._id}>
                      {/* Main Row */}
                      <tr
                        className={`border-t border-gray-700 cursor-pointer ${
                          index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                        }`}
                      >
                        <td className="p-2">{index + 1}</td>
                        <td
                          className="py-2"
                          onClick={() =>
                            dropUser({
                              playerId: player._id,
                              name: player.name,
                            })
                          }
                        >
                          {player.name}
                        </td>
                        <td className="py-2">{player.userName}</td>

                        <td
                          // colSpan={3}
                          className="py-2 flex gap-3 justify-start items-center"
                        >
                          <input
                            type="number"
                            min="0"
                            placeholder="Kill"
                            value={getValueFromDraft(
                              player.authId,
                              "kills",
                              player.kills || "",
                            )}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                player.authId,
                                "kills",
                                e.target.value,
                              )
                            }
                            className="border border-blue-600 bg-transparent px-2 py-1 w-12 rounded"
                          />
                          <input
                            type="number"
                            min="0"
                            placeholder="Win"
                            value={getValueFromDraft(
                              player.authId,
                              "wining",
                              player.wining || "",
                            )}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                player.authId,
                                "wining",
                                e.target.value,
                              )
                            }
                            className="border border-blue-600 bg-transparent px-2 py-1 w-12 rounded"
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">No players joined yet.</p>
        )}

        {players.length > 0 && (
          <div className="mt-4">
            <ButtonLoading
              className={`w-full ${
                inputError
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              text="Save Results"
              onclick={() => {
                if (!inputError) setShowModal(true);
              }}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-3">Confirm Submission</h2>

            <p className="text-gray-300 mb-6">All Player data will be saved.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (inputError) return;
                  setShowModal(false);
                  await handleSave();
                }}
                disabled={inputError}
                className={`w-full py-2 rounded ${
                  inputError
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {openUserRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-3">Confirm Submission</h2>

            <p className="text-gray-300 mb-6">
              Delete
              <strong className=" text-green-400 bg-gray-700 px-4 py-1 rounded mx-2">
                {openUserRow.name}
              </strong>
              from this match ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenUserRow(null)}
                className="w-full bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setOpenUserRow(null);
                  await deletSingleUser(openUserRow.playerId);
                }}
                disabled={inputError}
                className="w-full py-2 rounded bg-red-600 "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
