import WatchParty from "../models/WatchParty.js";

// Generate Random Room Code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create Watch Party
export const createParty = async (req, res) => {
  try {
    const { hostId, videoId } = req.body;

    if (!hostId || !videoId) {
      return res.status(400).json({
        success: false,
        message: "Host ID and Video ID are required",
      });
    }

    const roomCode = generateRoomCode();

    const party = await WatchParty.create({
      roomCode,
      host: hostId,
      video: videoId,
      participants: [hostId],
    });

    console.log("Party Saved:", party);

    return res.status(201).json({
      success: true,
      message: "Watch Party Created",
      party,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Join Party
export const joinParty = async (req, res) => {
  try {
    const { roomCode, userId } = req.body;

    const party = await WatchParty.findOne({ roomCode });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party Not Found",
      });
    }

    if (!party.participants.includes(userId)) {
      party.participants.push(userId);
      await party.save();
    }

    return res.status(200).json({
      success: true,
      party,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Party
export const getParty = async (req, res) => {
  try {
    const { roomCode } = req.params;

    console.log("Searching Room:", roomCode);

    const party = await WatchParty.findOne({ roomCode });

    console.log("Found Party:", party);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party Not Found",
      });
    }

    const populatedParty = await WatchParty.findById(party._id)
      .populate("host")
      .populate("participants")
      .populate("video");

    return res.status(200).json({
      success: true,
      party: populatedParty,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Leave Party
export const leaveParty = async (req, res) => {
  try {

    const { roomCode, userId } = req.body;

    const party = await WatchParty.findOne({ roomCode });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party Not Found",
      });
    }

    party.participants = party.participants.filter(
      (id) => id.toString() !== userId
    );

    if (party.participants.length === 0) {
      await WatchParty.deleteOne({ _id: party._id });
    } else {
      await party.save();
    }

    
    return res.status(200).json({
      success: true,
      message: "Left Party Successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};