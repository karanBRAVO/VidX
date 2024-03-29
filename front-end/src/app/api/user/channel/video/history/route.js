import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { connectToDB } from "@/lib/db/connect.js";
import { UserModel } from "@/lib/models/user.model.js";
import { VideoModel } from "@/lib/models/channel/video/video.model.js";
import { HistoryModel } from "@/lib/models/history/history.model.js";

export const POST = async (req, res) => {
  try {
    // getting the session details
    const token = await getToken({ req });
    const session = await getServerSession(authOptions);
    if (!token || !session) throw new Error(`Not authenticated`);

    // connect to db
    await connectToDB();

    // finding the user in db
    const user = await UserModel.findOne({
      name: session.user.name,
      email: session.user.email,
    });
    if (!user) throw new Error(`User not found`);

    // getting the details
    const { videoId } = await req.json();
    if (!videoId) throw new Error(`Video id not provided`);

    // checking the video
    const video = await VideoModel.findOne({ videoId });
    if (!video) throw new Error(`Video not found`);

    // saving
    const history = await HistoryModel.findOne({ userId: user._id });
    if (!history) {
      const newHistory = new HistoryModel({
        userId: user._id,
        details: {
          videoId,
        },
      });
      await newHistory.save();
    } else {
      await HistoryModel.updateOne(
        {
          userId: user._id,
        },
        { $push: { details: videoId } }
      );
    }

    // updating the views of the video
    if (!video.views.includes(user._id)) {
      await VideoModel.updateOne({ videoId }, { $push: { views: user._id } });
    }

    return NextResponse.json({
      success: true,
      message: "history saved successfully",
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
};
