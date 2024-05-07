import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { connectToDB } from "@/lib/db/connect.js";
import { UserModel } from "@/lib/models/user.model.js";
import { PlaylistModel } from "@/lib/models/playlist/playlist.model.js";

export const GET = async (req, res) => {
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
    const category = req.nextUrl.searchParams.get("category");
    if (!category) throw new Error(`Category not provided`);

    // fetching playlist collection
    const playlist = await PlaylistModel.findOne({ userId: user._id });
    if (!playlist) throw new Error(`No playlists found`);

    const playlistData = [];
    playlist.playlists.forEach((_playlist) => {
      if (_playlist.category === category) {
        playlistData.push({
          id: _playlist._id,
          name: _playlist.name,
          desc: _playlist.desc,
          imgSrc: "",
          createdAt: _playlist.createdAt,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Playlist sent successfully",
      playlistData,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
};
