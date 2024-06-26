import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { connectToDB } from "@/lib/db/connect.js";
import { UserModel } from "@/lib/models/user.model.js";
import { PlaylistModel } from "@/lib/models/playlist/playlist.model.js";
import { VideoModel } from "@/lib/models/channel/video/video.model.js";

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
    const { playlistId, videoId, category } = await req.json();
    if (!category || !playlistId || !videoId)
      throw new Error(`All fields are required`);

    // checking for playlist
    const playlist = await PlaylistModel.findOne({ userId: user._id });
    if (!playlist) throw new Error(`Playlist records not found`);

    let hasPlaylist = false;
    let _playlist = undefined;
    for (let i = 0; i < playlist.playlists.length; i++) {
      _playlist = playlist.playlists[i];
      if (
        _playlist.category === category &&
        String(_playlist._id === String(playlistId))
      ) {
        hasPlaylist = true;
        break;
      }
    }
    if (!hasPlaylist)
      throw new Error(
        `Playlist not found with category ${category} and id ${playlistId}`
      );

    // checking for the video
    const video = await VideoModel.findOne({ videoId });
    if (!video) throw new Error(`Video not found`);

    // adding to playlist
    await PlaylistModel.updateOne(
      { _id: playlist._id, "playlists._id": playlistId },
      { $push: { "playlists.$.videoIds": { videoId: videoId } } }
    );

    return NextResponse.json({
      success: true,
      message: "Added to playlist successfully",
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
};
