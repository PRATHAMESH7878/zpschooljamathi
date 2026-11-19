/* ==========================================================
   GALLERY DATA - the only file you edit to add photos.
   Photos are stored on ImageKit. One folder in ImageKit = one album.
   ========================================================== */

/* 1. Your ImageKit address (the "URL endpoint"). Keep the slash at the end. */
var PHOTO_BASE = "https://ik.imagekit.io/3aij7pf4r/";

/* 2. Picture sizes. ImageKit makes the smaller copies for you, and this saves
      your 20 GB monthly download limit.
      THUMB_TR : album cover cards   (width 600 pixels)
      VIEW_TR  : full-screen viewer  (width 1600 pixels)
      To show photos exactly as uploaded, write  ""  for both.            */
var THUMB_TR = "w-600";
var VIEW_TR  = "w-1600";

/* 3. The categories shown on the page (add or remove as you like).
      "id" is a short name with no spaces. Albums use it below.           */
var CATEGORIES = [
  { id: "functions", name: "Functions",           note: "Annual day, national festivals and other school functions." },
  { id: "events",    name: "Events",              note: "Competitions, visits, camps and special days." },
  { id: "creative",  name: "Creative Activities", note: "Drawing, craft, music, dance and other creative work." }
];

/* 4. The albums.
      Each album is one block between { and }, followed by a comma.

      category : the id of a category above
      title    : the name shown on the album
      date     : month and year, for example "November 2026"
      folder   : the folder name in ImageKit, written EXACTLY the same
                 (Marathi names and spaces are fine)
      photos   : the file names inside that folder, in the order to show them.
                 The first photo is the cover. Write the full name with the
                 ending, for example "IMG-20261115-WA0009.jpg"
      cover    : (optional) a file name to use as the cover instead

      HOW TO ADD AN ALBUM
        a) In ImageKit, make a folder and upload the photos into it.
        b) Copy one album block below, paste it under the last one, and
           change the details.
        c) Save. The website updates.

      SHORTCUT: if the photos are named 1.jpg, 2.jpg, 3.jpg ... you can write
      count: 12   instead of the photos list.                              */
var ALBUMS = [

  {
    category: "events",
    title:    "हिवाळी शिबीर 2026",
    date:     "November 2026",
    folder:   "हिवाळी शिबीर 2026",
    photos:   [
      "IMG-20261115-WA0009.jpg","IMG-20261115-WA0010.jpg","IMG-20261115-WA0015.jpg","IMG-20261115-WA0011.jpg"
      /* Add the other file names of this folder here. Put a comma after each
         name except the last one, for example:
         "IMG-20261115-WA0009.jpg",
         IMG-20261115-WA0015.jpg,
         "IMG-20261115-WA0010.jpg"                                         */
    ]
  },
{
  category: "events",
  title: "School Achievements",
  folder: "School Achievements",
  photos: [
    "IMG-20261115-WA0005.jpg",
    "IMG-20261115-WA0004.jpg",
    "IMG-20261115-WA0003.jpg"
  ]
}

];
