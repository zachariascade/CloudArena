export type GalleryEntry = {
  title: string;
  artist: string;
  year: string;
  wikiUrl: string;
  imageUrl: string;
  createdAt: string;
  cardUsed: string[];
};

function createCommonsFilePageUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`;
}

function createCommonsFilePathUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

export const GALLERY: GalleryEntry[] = [
  {
    title: "The Ancient of Days",
    artist: "William Blake",
    year: "1794",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:The_Ancient_of_Days_(Blake,_Research_Issues).jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: [
      "/cards/gallery_ancient_of_days",
      "/cards/son_of_man",
    ],
  },
  {
    title: "The Angel Stopping Abraham",
    artist: "Rembrandt van Rijn",
    year: "1635",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son,_Isaac.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_angel_stopping_abraham"],
  },
  {
    title: "The Annunciation",
    artist: "Fra Angelico",
    year: "c. 1440–1445",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fa/Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: [
      "/cards/gallery_annunciation",
      "/cards/gabriel_the_messenger",
    ],
  },
  {
    title: "Belshazzar's Feast",
    artist: "John Martin",
    year: "1820",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg/960px-John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: [
      "/cards/belshazzar",
      "/cards/writing_on_the_wall",
      "/cards/mene_mene_tekel_upharsin",
    ],
  },
  {
    title: "Belshazzar's Feast",
    artist: "Rembrandt van Rijn",
    year: "c. 1635–1638",
    wikiUrl: createCommonsFilePageUrl("Belshazzar's Feast.jpg"),
    imageUrl: createCommonsFilePathUrl("Belshazzar's Feast.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Feast of Belshazzar",
    artist: "Pietro Dandini",
    year: "late 17th - early 18th century",
    wikiUrl:
      "https://italian-art.pushkinmuseum.art/canvas/17-18_century/d/dandini_pietro_pier/belshazzars_feast/index.php?lang=en",
    imageUrl:
      "https://www.art-prints-on-demand.com/kunst/pietro_dandini/das_gastmahl_des_belsazar.jpg",
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ and St Mary Magdalen at the Tomb",
    artist: "Rembrandt van Rijn",
    year: "1638",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg/960px-Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_christ_and_mary_magdalen"],
  },
  {
    title: "The Creation of Adam",
    artist: "Michelangelo",
    year: "c. 1508–1512",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_creation_of_adam"],
  },
  {
    title: "The Deluge",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/960px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_deluge"],
  },
  {
    title: "Abraham and the Three Angels",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("Abraham and the Three Angels.png"),
    imageUrl: createCommonsFilePathUrl("Abraham and the Three Angels.png"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Abraham Journeying into the Land of Canaan",
    artist: "Gustave Doré",
    year: "1873",
    wikiUrl:
      createCommonsFilePageUrl("Abraham Journeying into the Land of Canaan (89393798).jpg"),
    imageUrl:
      createCommonsFilePathUrl("Abraham Journeying into the Land of Canaan (89393798).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Adam and Eve Driven out of Eden",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("003.Adam and Eve Are Driven out of Eden.jpg"),
    imageUrl: createCommonsFilePathUrl("003.Adam and Eve Are Driven out of Eden.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Achan Is Stoned to Death",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("048.Achan Is Stoned to Death.jpg"),
    imageUrl: createCommonsFilePathUrl("048.Achan Is Stoned to Death.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Baruch Writing Jeremiah's Prophecies",
    artist: "Gustave Doré",
    year: "1874",
    wikiUrl:
      createCommonsFilePageUrl("Baruch Writing Jeremiah's Prophecies (89467495).jpg"),
    imageUrl:
      createCommonsFilePathUrl("Baruch Writing Jeremiah's Prophecies (89467495).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Confusion of Tongues",
    artist: "Gustave Doré",
    year: "1865",
    wikiUrl: createCommonsFilePageUrl("Confusion of Tongues.png"),
    imageUrl: createCommonsFilePathUrl("Confusion of Tongues.png"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Dove Sent Forth from the Ark",
    artist: "Gustave Doré",
    year: "1873",
    wikiUrl:
      createCommonsFilePageUrl("Dove Sent Forth from the Ark (89393604).jpg"),
    imageUrl:
      createCommonsFilePathUrl("Dove Sent Forth from the Ark (89393604).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Expulsion of Ishmael and His Mother",
    artist: "Gustave Doré",
    year: "1873",
    wikiUrl:
      createCommonsFilePageUrl("Expulsion of Ishmael and His Mother (89393994).jpg"),
    imageUrl:
      createCommonsFilePathUrl("Expulsion of Ishmael and His Mother (89393994).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Flood Destroying the World",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("Flood destroying the world.jpg"),
    imageUrl: createCommonsFilePathUrl("Flood destroying the world.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Joshua Crossing Jordan",
    artist: "Gustave Doré",
    year: "1873",
    wikiUrl:
      createCommonsFilePageUrl("Joshua Crossing Jordan (89396850).jpg"),
    imageUrl:
      createCommonsFilePathUrl("Joshua Crossing Jordan (89396850).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Death of Abimelech",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("057.The Death of Abimelech.jpg"),
    imageUrl: createCommonsFilePathUrl("057.The Death of Abimelech.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Destruction of Leviathan",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("122.The Destruction of Leviathan.jpg"),
    imageUrl: createCommonsFilePathUrl("122.The Destruction of Leviathan.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Noah Curses Ham and Canaan",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: createCommonsFilePageUrl("009.Noah Curses Ham and Canaan.jpg"),
    imageUrl: createCommonsFilePathUrl("009.Noah Curses Ham and Canaan.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Great Day of His Wrath",
    artist: "John Martin",
    year: "1853",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_great_day_of_his_wrath"],
  },
  {
    title: "The Great Red Dragon",
    artist: "William Blake",
    year: "c. 1805",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg/960px-William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: [
      "/cards/gallery_great_red_dragon",
      "/cards/enemy_great_red_dragon_dragon_of_the_sun",
    ],
  },
  {
    title: "Jacob Wrestles with the Angel",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:024.Jacob_Wrestles_with_the_Angel.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/024.Jacob_Wrestles_with_the_Angel.jpg/960px-024.Jacob_Wrestles_with_the_Angel.jpg",
    createdAt: "2026-04-27T22:20:25-05:00",
    cardUsed: ["/cards/gallery_jacob_wrestles_with_the_angel"],
  },
  {
    title: "Joshua Commanding the Sun to Stand Still upon Gibeon",
    artist: "John Martin",
    year: "1816",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_(1816)_John_Martin_-_NGA_2004.64.1.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg/960px-Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: [
      "/cards/gallery_joshua_commanding_the_sun_to_stand_still_upon_gibeon",
    ],
  },
  {
    title: "The Last Judgment",
    artist: "Hieronymus Bosch",
    year: "c. 1482",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Hieronymus_Bosch_-_The_Last_Judgement.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Hieronymus_Bosch_-_The_Last_Judgement.jpg/960px-Hieronymus_Bosch_-_The_Last_Judgement.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: [
      "/cards/gallery_last_judgment",
    ],
  },
  {
    title: "The Fall of the Damned",
    artist: "Peter Paul Rubens",
    year: "c. 1621",
    wikiUrl: createCommonsFilePageUrl("Peter Paul Rubens - Fall of the damned.jpg"),
    imageUrl: createCommonsFilePathUrl("Peter Paul Rubens - Fall of the damned.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Judgment",
    artist: "John Martin",
    year: "1853",
    wikiUrl: createCommonsFilePageUrl(
      "John Martin - The Last Judgement - Google Art Project.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "John Martin - The Last Judgement - Google Art Project.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Judgment",
    artist: "Frans Floris",
    year: "1565",
    wikiUrl: createCommonsFilePageUrl("Frans Floris - The last judgement.jpg"),
    imageUrl: createCommonsFilePathUrl("Frans Floris - The last judgement.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Hell",
    artist: "Hans Memling",
    year: "c. 1485",
    wikiUrl: createCommonsFilePageUrl("Hans Memling - Hell - WGA14941.jpg"),
    imageUrl: createCommonsFilePathUrl("Hans Memling - Hell - WGA14941.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Supper",
    artist: "Jacopo Tintoretto",
    year: "1592–1594",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg/960px-Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_last_supper"],
  },
  {
    title: "The Opening of the Fifth Seal",
    artist: "El Greco",
    year: "c. 1608–1614",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:El_Greco_-_The_Opening_of_the_Fifth_Seal_(The_Vision_of_St_John)_-_WGA10637.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg/960px-El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_opening_of_the_fifth_seal"],
  },
  {
    title: "The Plains of Heaven",
    artist: "John Martin",
    year: "1851",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_plains_of_heaven"],
  },
  {
    title: "The Sacrifice of Isaac",
    artist: "Caravaggio",
    year: "c. 1603",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Sacrifice_of_Isaac-Caravaggio_(Uffizi).jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg/960px-Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_sacrifice_of_isaac"],
  },
  {
    title: "Saint Michael Vanquishing Satan",
    artist: "Raphael",
    year: "1518",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/74/Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: [
      "/cards/gallery_saint_michael_vanquishing_satan",
      "/cards/michael_the_archangel",
    ],
  },
  {
    title: "Satan in Cocytus",
    artist: "Gustave Doré",
    year: "1861",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Gustave_Dore_Inferno34.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gustave_Dore_Inferno34.jpg/960px-Gustave_Dore_Inferno34.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: [
      "/cards/gallery_satan_in_cocytus",
      "/cards/enemy_satan_in_cocytus",
    ],
  },
  {
    title: "Sodom and Gomorrah",
    artist: "John Martin",
    year: "1852",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_Sodom_and_Gomorrah.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/John_Martin_-_Sodom_and_Gomorrah.jpg/960px-John_Martin_-_Sodom_and_Gomorrah.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_sodom_and_gomorrah"],
  },
  {
    title: "The Tower of Babel",
    artist: "Gustave Doré",
    year: "1865",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    createdAt: "2026-04-27T22:26:33-05:00",
    cardUsed: ["/cards/gallery_tower_of_babel"],
  },
  {
    title: "The Transfiguration",
    artist: "Raphael",
    year: "1516–1520",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Transfiguration_Raphael.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Transfiguration_Raphael.jpg/960px-Transfiguration_Raphael.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: ["/cards/gallery_transfiguration"],
  },
  {
    title: "The Triumph of Christianity Over Paganism",
    artist: "Gustave Doré",
    year: "1868",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg/960px-The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: ["/cards/gallery_triumph_of_christianity_over_paganism"],
  },
  {
    title: "The Woman Taken in Adultery",
    artist: "Rembrandt van Rijn",
    year: "1644",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg/960px-Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: ["/cards/gallery_woman_taken_in_adultery"],
  },
  {
    title: "Christ in the Storm on the Sea of Galilee",
    artist: "Rembrandt van Rijn",
    year: "1633",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Driving the Money Changers from the Temple",
    artist: "Rembrandt van Rijn",
    year: "1626",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Baptism of Jesus",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Baptism_of_Jesus_(Bapt%C3%AAme_de_J%C3%A9sus)_-_James_Tissot_-_overall.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Baptism_of_Jesus_(Bapt%C3%AAme_de_J%C3%A9sus)_-_James_Tissot_-_overall.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Good Samaritan",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Good_Samaritan_(Le_bon_samaritain)_-_James_Tissot.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Good_Samaritan_(Le_bon_samaritain)_-_James_Tissot.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Flight into Egypt",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Flight_into_Egypt_(La_fuite_en_%C3%89gypte)_-_James_Tissot_-_overall.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Flight_into_Egypt_(La_fuite_en_%C3%89gypte)_-_James_Tissot_-_overall.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Visitation",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Visitation_(La_visitation)_-_James_Tissot_-_overall.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Visitation_(La_visitation)_-_James_Tissot_-_overall.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Appears to Mary Magdalene",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Resurrection of Lazarus",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Resurrection_of_Lazarus_(La_r%C3%A9surrection_de_Lazare)_-_James_Tissot.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Resurrection_of_Lazarus_(La_r%C3%A9surrection_de_Lazare)_-_James_Tissot.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "The Incredulity of Saint Thomas",
    artist: "Caravaggio",
    year: "1601–1602",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:The_Incredulity_of_Saint_Thomas.jpg",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The_Incredulity_of_Saint_Thomas.jpg",
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Looking through a Lattice",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Looking through a Lattice (Jésus regardant à travers le treillis) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Looking through a Lattice (Jésus regardant à travers le treillis) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-27T22:45:30-05:00",
    cardUsed: [],
  },
  {
    title: "Portrait of Zacharias and Elizabeth",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Portrait of Zacharias and Elizabeth (Portrait de Zacharie et d'Elisabeth) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Portrait of Zacharias and Elizabeth (Portrait de Zacharie et d'Elisabeth) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Vision of Zacharias",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Vision of Zacharias (Vision de Zacharie) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Vision of Zacharias (Vision de Zacharie) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Testing of the Suitors of the Holy Virgin",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Testing of the Suitors of the Holy Virgin (L'épreuve des prétendants au mariage de la sainte Vierge) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Testing of the Suitors of the Holy Virgin (L'épreuve des prétendants au mariage de la sainte Vierge) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Betrothal of the Holy Virgin and Saint Joseph",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Betrothal of the Holy Virgin and Saint Joseph (Fiançailles de la sainte vierge et de saint Joseph) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Betrothal of the Holy Virgin and Saint Joseph (Fiançailles de la sainte vierge et de saint Joseph) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Holy Virgin in Her Youth",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Holy Virgin in Her Youth (La sainte vierge jeune) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Holy Virgin in Her Youth (La sainte vierge jeune) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Magnificat",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Magnificat (Le magnificat) - James Tissot - overall .jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Magnificat (Le magnificat) - James Tissot - overall .jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Anxiety of Saint Joseph",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Anxiety of Saint Joseph (L'anxiété de Saint Joseph) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Anxiety of Saint Joseph (L'anxiété de Saint Joseph) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint Joseph",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Saint Joseph - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Saint Joseph - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Childhood of Saint John the Baptist",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Childhood of Saint John the Baptist (L'enfance de saint Jean-Baptiste) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Childhood of Saint John the Baptist (L'enfance de saint Jean-Baptiste) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint Joseph Seeks a Lodging in Bethlehem",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Saint Joseph Seeks a Lodging in Bethlehem (Saint Joseph cherche un gîte à Bethléem) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Saint Joseph Seeks a Lodging in Bethlehem (Saint Joseph cherche un gîte à Bethléem) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Birth of Our Lord Jesus Christ",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Birth of Our Lord Jesus Christ (La nativité de Notre-Seigneur Jésus-Christ) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Birth of Our Lord Jesus Christ (La nativité de Notre-Seigneur Jésus-Christ) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Angel and the Shepherds",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Angel and the Shepherds (L'ange et les bergers) - James Tissot.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Angel and the Shepherds (L'ange et les bergers) - James Tissot.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Adoration of the Shepherds",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Adoration of the Shepherds (L'adoration des bergers) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Adoration of the Shepherds (L'adoration des bergers) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Aged Simeon",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Aged Simeon (Le vieux Siméon) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Aged Simeon (Le vieux Siméon) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Presentation of Jesus in the Temple",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Presentation of Jesus in the Temple (La présentation de Jésus au Temple) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Presentation of Jesus in the Temple (La présentation de Jésus au Temple) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Adoration of the Magi",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Adoration of the Magi (L'adoration des mages) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Adoration of the Magi (L'adoration des mages) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus and his Mother at the Fountain",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus and his Mother at the Fountain (Jésus et sa mère à la fontaine) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus and his Mother at the Fountain (Jésus et sa mère à la fontaine) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Found in the Temple",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Found in the Temple (Jesus retrouvé dans le temple) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Found in the Temple (Jesus retrouvé dans le temple) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Among the Doctors",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Among the Doctors (Jésus parmi les docteurs) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Among the Doctors (Jésus parmi les docteurs) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Return from Egypt",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Return from Egypt (Retour d'Égypte) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Return from Egypt (Retour d'Égypte) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Sojourn in Egypt",
    artist: "James Tissot",
    year: "1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Sojourn in Egypt (Le séjour en Égypte) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Sojourn in Egypt (Le séjour en Égypte) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Transported by a Spirit onto a High Mountain",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Transported by a Spirit onto a High Mountain (Jésus transporté par l'esprit sur une haute montagne) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Transported by a Spirit onto a High Mountain (Jésus transporté par l'esprit sur une haute montagne) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Tempted in the Wilderness",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Tempted in the Wilderness (Jésus tenté dans le désert) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Tempted in the Wilderness (Jésus tenté dans le désert) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Voice in the Desert",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Voice in the Desert (La voix dans le désert) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Voice in the Desert (La voix dans le désert) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Carried up to a Pinnacle of the Temple",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Carried up to a Pinnacle of the Temple (Jésus porté sur le pinacle du Temple) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Carried up to a Pinnacle of the Temple (Jésus porté sur le pinacle du Temple) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Ministered to by Angels",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - Jesus Ministered to by Angels (Jésus assisté par les anges) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - Jesus Ministered to by Angels (Jésus assisté par les anges) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Calling of Saint Peter and Saint Andrew",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Calling of Saint Peter and Saint Andrew (Vocation de Saint Pierre et Saint André) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Calling of Saint Peter and Saint Andrew (Vocation de Saint Pierre et Saint André) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Calling of Saint John and Saint Andrew",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Calling of Saint John and Saint Andrew (Vocation de Saint Jean et de Saint André) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Calling of Saint John and Saint Andrew (Vocation de Saint Jean et de Saint André) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Calling of Saint James and Saint John",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl(
      "Brooklyn Museum - The Calling of Saint James and Saint John (Vocation de Saint Jacques et de Saint Jean) - James Tissot - overall.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Brooklyn Museum - The Calling of Saint James and Saint John (Vocation de Saint Jacques et de Saint Jean) - James Tissot - overall.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Pietà",
    artist: "Michelangelo",
    year: "c. 1498–1499",
    wikiUrl: createCommonsFilePageUrl("La Pietà.jpg"),
    imageUrl: createCommonsFilePathUrl("La Pietà.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "David",
    artist: "Michelangelo",
    year: "1501–1504",
    wikiUrl: createCommonsFilePageUrl("Statue of David - Michelangelo.JPG"),
    imageUrl: createCommonsFilePathUrl("Statue of David - Michelangelo.JPG"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Moses",
    artist: "Michelangelo",
    year: "c. 1513–1515",
    wikiUrl: createCommonsFilePageUrl("Moses-by-Michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Moses-by-Michelangelo.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Rebellious Slave",
    artist: "Michelangelo",
    year: "c. 1513–1516",
    wikiUrl: createCommonsFilePageUrl("Rebellious Slave (Michelangelo).jpg"),
    imageUrl: createCommonsFilePathUrl("Rebellious Slave (Michelangelo).jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Dying Slave",
    artist: "Michelangelo",
    year: "c. 1513–1516",
    wikiUrl: createCommonsFilePageUrl("Dying Slave Michelangelo JBU067.jpg"),
    imageUrl: createCommonsFilePathUrl("Dying Slave Michelangelo JBU067.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Judgment (Michelangelo)",
    artist: "Michelangelo",
    year: "1536–1541",
    wikiUrl: createCommonsFilePageUrl("Last Judgement by Michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Last Judgement by Michelangelo.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Separation of Light from Darkness",
    artist: "Michelangelo",
    year: "c. 1511–1512",
    wikiUrl: createCommonsFilePageUrl(
      "Michelangelo, Separation of Light from Darkness 00.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Michelangelo, Separation of Light from Darkness 00.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Creation of Eve",
    artist: "Michelangelo",
    year: "1511",
    wikiUrl: createCommonsFilePageUrl("Creation of Eve, michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Creation of Eve, michelangelo.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Fall and Expulsion from Paradise",
    artist: "Michelangelo",
    year: "c. 1510–1511",
    wikiUrl: createCommonsFilePageUrl(
      "Michelangelo, Fall and Expulsion from Garden of Eden 04.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Michelangelo, Fall and Expulsion from Garden of Eden 04.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Cumaean Sibyl",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("CumaeanSibylByMichelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("CumaeanSibylByMichelangelo.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Libyan Sibyl",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo the libyan.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo the libyan.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Prophet Jonah",
    artist: "Michelangelo",
    year: "c. 1508–1512",
    wikiUrl: createCommonsFilePageUrl("Sistine jonah.jpg"),
    imageUrl: createCommonsFilePathUrl("Sistine jonah.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Prophet Ezekiel",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo - Prophet Ezekiel.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo - Prophet Ezekiel.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Prophet Jeremiah",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo, profeti, Jeremiah 01.jpg"),
    imageUrl: createCommonsFilePathUrl(
      "Michelangelo, profeti, Jeremiah 01.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Prophet Isaiah",
    artist: "Michelangelo",
    year: "c. 1511–1512",
    wikiUrl: createCommonsFilePageUrl(
      "'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36FXD.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36FXD.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Pantocrator",
    artist: "Unknown",
    year: "19th century",
    wikiUrl: createCommonsFilePageUrl("Christ Pantocrator icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Christ Pantocrator icon.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Nativity of Jesus",
    artist: "Unknown",
    year: "before 20th century",
    wikiUrl: createCommonsFilePageUrl(
      "031 Nativity of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "031 Nativity of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Theotokos of Vladimir",
    artist: "Anonymous",
    year: "12th century",
    wikiUrl: createCommonsFilePageUrl("Virgin of Vladimir.jpg"),
    imageUrl: createCommonsFilePathUrl("Virgin of Vladimir.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Virgin Hodegetria",
    artist: "Anonymous",
    year: "13th century",
    wikiUrl: createCommonsFilePageUrl(
      "Front side of a double sided icon with the Virgin Hodegetria. 13th cent. at the Byzantine and Christian Museum on 12 April 2019.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Front side of a double sided icon with the Virgin Hodegetria. 13th cent. at the Byzantine and Christian Museum on 12 April 2019.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Dormition of the Theotokos",
    artist: "Unknown",
    year: "19th century",
    wikiUrl: createCommonsFilePageUrl("Dormition-of-the-Theotokos Icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Dormition-of-the-Theotokos Icon.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Dormition of the Theotokos (Byzantine Icon)",
    artist: "Unknown",
    year: "medieval",
    wikiUrl: createCommonsFilePageUrl("Dormition icon detail.jpg"),
    imageUrl: createCommonsFilePathUrl("Dormition icon detail.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Annunciation",
    artist: "Wikivorker",
    year: "2024",
    wikiUrl: createCommonsFilePageUrl("Annunciation. Orthodox icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Annunciation. Orthodox icon.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Baptism of Christ",
    artist: "Athanasios Margaritis",
    year: "1850",
    wikiUrl: createCommonsFilePageUrl(
      "019 Baptism of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "019 Baptism of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Crucifixion of Jesus",
    artist: "Unknown",
    year: "1855",
    wikiUrl: createCommonsFilePageUrl(
      "024 Crucifixion of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "024 Crucifixion of Jesus Icon from Saint Paraskevi Church in Langadas.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Mystical Last Supper",
    artist: "Anonymous",
    year: "1497",
    wikiUrl: createCommonsFilePageUrl("Icon last supper.jpg"),
    imageUrl: createCommonsFilePathUrl("Icon last supper.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Descent into Hell",
    artist: "Unknown",
    year: "pre-20th century",
    wikiUrl: createCommonsFilePageUrl("III Descent into Hell.jpg"),
    imageUrl: createCommonsFilePathUrl("III Descent into Hell.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Ascension",
    artist: "Unknown",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl("Ascension icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Ascension icon.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Entry into Jerusalem",
    artist: "Unknown",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Entry into Jerusalem.jpg"),
    imageUrl: createCommonsFilePathUrl("Entry into Jerusalem.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Trinity",
    artist: "Andrei Rublev",
    year: "early 15th century",
    wikiUrl: createCommonsFilePageUrl(
      "Andrey Rublev - Св. Троица - Google Art Project.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Andrey Rublev - Св. Троица - Google Art Project.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Transfiguration (Yaroslavl Icon)",
    artist: "Unknown",
    year: "1516",
    wikiUrl: createCommonsFilePageUrl(
      "Icon of transfiguration (Spaso-Preobrazhensky Monastery, Yaroslavl).jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Icon of transfiguration (Spaso-Preobrazhensky Monastery, Yaroslavl).jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Transfiguration (Theophanes the Cretan)",
    artist: "Theophanes the Cretan",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl(
      "Icon of the Transfiguration by Theophanes the Cretan.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Icon of the Transfiguration by Theophanes the Cretan.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Archangel Michael",
    artist: "Unknown",
    year: "13th century",
    wikiUrl: createCommonsFilePageUrl("Mikharkhangel.jpg"),
    imageUrl: createCommonsFilePathUrl("Mikharkhangel.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/michael_the_archangel",
    ],
  },
  {
    title: "Saint George",
    artist: "Unknown",
    year: "14th century",
    wikiUrl: createCommonsFilePageUrl(
      "Icon of Saint George, 14th century from Constantinople, Byzantine and Christian Museum, Athens.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Icon of Saint George, 14th century from Constantinople, Byzantine and Christian Museum, Athens.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Archangel Michael (Serbian Orthodox Icon)",
    artist: "DKjellby",
    year: "2023",
    wikiUrl: createCommonsFilePageUrl(
      "Archangel Michael Serbian-Orthodox Icon.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Archangel Michael Serbian-Orthodox Icon.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Our Lady of the Sign",
    artist: "Unknown",
    year: "first half of 12th century",
    wikiUrl: createCommonsFilePageUrl(
      "Orthodox icon of Our Lady of the Sign. Veliky Novgorod, Russia.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Orthodox icon of Our Lady of the Sign. Veliky Novgorod, Russia.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Adam and Eve",
    artist: "Lucas Cranach the Elder",
    year: "1526",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Lucas_Cranach_the_Elder_-_Adam_and_Eve_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Lucas_Cranach_the_Elder_-_Adam_and_Eve_-_Google_Art_Project.jpg/960px-Lucas_Cranach_the_Elder_-_Adam_and_Eve_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Angel with the Millstone",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_14.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/D%C3%BCrer_Apocalypse_14.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Bard",
    artist: "John Martin",
    year: "1817",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Bard_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/John_Martin_-_The_Bard_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Bard_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Cain and Abel Offer Their Sacrifices",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/004.Cain_and_Abel_Offer_Their_Sacrifices.jpg/960px-004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Cain Slays Abel",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:005.Cain_Slays_Abel.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/005.Cain_Slays_Abel.jpg/960px-005.Cain_Slays_Abel.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Calling of Saint Matthew",
    artist: "Caravaggio",
    year: "1599–1600",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Calling-of-st-matthew.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Calling-of-st-matthew.jpg/960px-Calling-of-st-matthew.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Carrying the Cross",
    artist: "El Greco",
    year: "c. 1580",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:El_Greco_-_Christ_Carrying_the_Cross_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/El_Greco_-_Christ_Carrying_the_Cross_-_Google_Art_Project.jpg/960px-El_Greco_-_Christ_Carrying_the_Cross_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Crucifixion of Jesus",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_Crucifixion_of_Jesus.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Gustave_Dor%C3%A9_-_Crucifixion_of_Jesus.jpg/960px-Gustave_Dor%C3%A9_-_Crucifixion_of_Jesus.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Deliverance from the Lions' Den",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:131.Daniel_in_the_Lions%27_Den.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/131.Daniel_in_the_Lions%27_Den.jpg/960px-131.Daniel_in_the_Lions%27_Den.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: ["/cards/gallery_daniel_in_the_lions_den", "/cards/daniel"],
  },
  {
    title: "The Three Hebrews Cast into the Fiery Furnace",
    artist: "Unknown",
    year: "15th century",
    wikiUrl: createCommonsFilePageUrl(
      "Folio 40v - The Three Hebrews Cast into the Fiery Furnace.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Folio 40v - The Three Hebrews Cast into the Fiery Furnace.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [
      "/cards/meshach_shadrach_and_abednego",
      "/cards/deliverance_from_fire",
      "/cards/golden_image",
    ],
  },
  {
    title: "Daniel Interpreting Nebuchadnezzar's Dream",
    artist: "W. A. Spicer",
    year: "1917",
    wikiUrl: createCommonsFilePageUrl("Daniel Interpreting Nebuchadnezzar's Dream.jpg"),
    imageUrl: createCommonsFilePathUrl("Daniel Interpreting Nebuchadnezzar's Dream.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [
      "/cards/dream_of_the_tree",
      "/cards/nebuchadnezzar_beast_of_the_field",
      "/cards/nebuchadnezzar_king_of_babylon",
    ],
  },
  {
    title: "Nebuchadnezzar's Dream: The Felled Tree",
    artist: "Unknown",
    year: "15th century",
    wikiUrl: createCommonsFilePageUrl("Songe Nabuchodonosor arbre.jpg"),
    imageUrl: createCommonsFilePathUrl("Songe Nabuchodonosor arbre.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [
      "/cards/dream_of_the_tree",
    ],
  },
  {
    title: "Daniel and the Four Fantastic Beasts",
    artist: "Wellcome Library, London",
    year: "1634",
    wikiUrl: createCommonsFilePageUrl(
      "Daniel and the four fantastic beasts. Engraving, 1634. Wellcome V0034350.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Daniel and the four fantastic beasts. Engraving, 1634. Wellcome V0034350.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [
      "/cards/terrifying_fourth_beast",
      "/cards/leopard_with_wings",
    ],
  },
  {
    title: "Nebuchadnezzar's Statue",
    artist: "Unknown",
    year: "15th century",
    wikiUrl: createCommonsFilePageUrl(
      "The Hague, KB, 131 A 3, Nebuchadnezzar's statue.jpeg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "The Hague, KB, 131 A 3, Nebuchadnezzar's statue.jpeg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [
      "/cards/golden_image",
      "/cards/dream_of_the_statue",
    ],
  },
  {
    title: "David Slays Goliath",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:071A.David_Slays_Goliath.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/071A.David_Slays_Goliath.jpg/960px-071A.David_Slays_Goliath.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "A Dove Is Sent Forth from the Ark",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:008.A_Dove_Is_Sent_Forth_from_the_Ark.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/008.A_Dove_Is_Sent_Forth_from_the_Ark.jpg/960px-008.A_Dove_Is_Sent_Forth_from_the_Ark.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Dragon and the Two Beasts",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_13.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ad/D%C3%BCrer_Apocalypse_13.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Elijah Ascends to Heaven in a Chariot of Fire",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:095.Elijah_Ascends_to_Heaven_in_a_Chariot_of_Fire.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/095.Elijah_Ascends_to_Heaven_in_a_Chariot_of_Fire.jpg/960px-095.Elijah_Ascends_to_Heaven_in_a_Chariot_of_Fire.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Four Angels at the Four Corners of the Earth",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_6.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/D%C3%BCrer_Apocalypse_6.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Four Angels of the Euphrates",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_11.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/D%C3%BCrer_Apocalypse_11.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Four Horsemen of the Apocalypse",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_4.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/D%C3%BCrer_Apocalypse_4.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Garden of Earthly Delights",
    artist: "Hieronymus Bosch",
    year: "c. 1490–1510",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/960px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Garden of Earthly Delights - Central Panel",
    artist: "Hieronymus Bosch",
    year: "c. 1490–1510",
    wikiUrl: createCommonsFilePageUrl(
      "Hieronymus Bosch - Triptych of Garden of Earthly Delights (central panel) - WGA2507.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Hieronymus Bosch - Triptych of Garden of Earthly Delights (central panel) - WGA2507.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Garden of Earthly Delights: The Earthly Paradise",
    artist: "Hieronymus Bosch",
    year: "c. 1490–1510",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Hieronymus_Bosch_-_The_Garden_of_Earthly_Delights_-_The_Earthly_Paradise_(Garden_of_Eden).jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Hieronymus_Bosch_-_The_Garden_of_Earthly_Delights_-_The_Earthly_Paradise_%28Garden_of_Eden%29.jpg/960px-Hieronymus_Bosch_-_The_Garden_of_Earthly_Delights_-_The_Earthly_Paradise_%28Garden_of_Eden%29.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Praying in the Garden of Gethsemane",
    artist: "Gustave Doré",
    year: "1878",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Jesus_Praying_in_the_Garden_(1878)_(14577654100).jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Jesus_Praying_in_the_Garden_%281878%29_%2814577654100%29.jpg/960px-Jesus_Praying_in_the_Garden_%281878%29_%2814577654100%29.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jonah Is Spewed Forth by the Whale",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg/960px-137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Judith Beheading Holofernes",
    artist: "Caravaggio",
    year: "c. 1598–1599",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Judith_Beheading_Holofernes_-_Caravaggio.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Judith_Beheading_Holofernes_-_Caravaggio.jpg/960px-Judith_Beheading_Holofernes_-_Caravaggio.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Key to the Bottomless Pit",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_10.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9e/D%C3%BCrer_Apocalypse_10.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Landscape with Saint John on Patmos",
    artist: "Nicolas Poussin",
    year: "c. 1640",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Nicolas_Poussin_-_Landscape_with_Saint_John_on_Patmos_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nicolas_Poussin_-_Landscape_with_Saint_John_on_Patmos_-_Google_Art_Project.jpg/960px-Nicolas_Poussin_-_Landscape_with_Saint_John_on_Patmos_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Judgment (Winged Altar)",
    artist: "Fra Angelico",
    year: "c. 1425–1430",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_The_Last_Judgement_(Winged_Altar)_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Fra_Angelico_-_The_Last_Judgement_%28Winged_Altar%29_-_Google_Art_Project.jpg/960px-Fra_Angelico_-_The_Last_Judgement_%28Winged_Altar%29_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Martyrdom of St. John",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_3.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/D%C3%BCrer_Apocalypse_3.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Moses Comes Down from Mount Sinai",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:039.Moses_Comes_Down_from_Mount_Sinai.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/039.Moses_Comes_Down_from_Mount_Sinai.jpg/960px-039.Moses_Comes_Down_from_Mount_Sinai.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Moses Smashing the Tablets of the Law",
    artist: "Rembrandt van Rijn",
    year: "1659",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_-_Moses_Smashing_the_Tablets_of_the_Law_-_WGA19132.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rembrandt_-_Moses_Smashing_the_Tablets_of_the_Law_-_WGA19132.jpg/960px-Rembrandt_-_Moses_Smashing_the_Tablets_of_the_Law_-_WGA19132.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Nebuchadnezzar",
    artist: "William Blake",
    year: "1795",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:William_Blake_-_Nebuchadnezzar_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/William_Blake_-_Nebuchadnezzar_-_Google_Art_Project.jpg/960px-William_Blake_-_Nebuchadnezzar_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/nebuchadnezzar_beast_of_the_field",
      "/cards/nebuchadnezzar_king_of_babylon",
      "/cards/dream_of_the_tree",
    ],
  },
  {
    title: "Cyrus the Great",
    artist: "Alireza Shakernia",
    year: "2009",
    wikiUrl: createCommonsFilePageUrl("Cyrus the Great.jpg"),
    imageUrl: createCommonsFilePathUrl("Cyrus the Great.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: ["/cards/cyrus_the_great"],
  },
  {
    title: "Darius I",
    artist: "Rumlu",
    year: "2024",
    wikiUrl: createCommonsFilePageUrl("Darius I.jpg"),
    imageUrl: createCommonsFilePathUrl("Darius I.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: ["/cards/darius_the_mede"],
  },
  {
    title: "The New Jerusalem",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_15.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/D%C3%BCrer_Apocalypse_15.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Opening of the Fifth and Sixth Seals",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_5.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/14/D%C3%BCrer_Apocalypse_5.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Raising of the Cross",
    artist: "Peter Paul Rubens",
    year: "1611",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_The_Raising_of_the_Cross.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Peter_Paul_Rubens_-_The_Raising_of_the_Cross.jpg/960px-Peter_Paul_Rubens_-_The_Raising_of_the_Cross.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Return of the Prodigal Son",
    artist: "Rembrandt van Rijn",
    year: "1668",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Rembrandt_-_The_Return_of_the_Prodigal_Son_-_WGA19133.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Rembrandt_-_The_Return_of_the_Prodigal_Son_-_WGA19133.jpg/960px-Rembrandt_-_The_Return_of_the_Prodigal_Son_-_WGA19133.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Sadak in Search of the Waters of Oblivion",
    artist: "John Martin",
    year: "1812",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:John_Martin_-_Sadak_in_Search_of_the_Waters_of_Oblivion.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7d/John_Martin_-_Sadak_in_Search_of_the_Waters_of_Oblivion.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Samson and Delilah",
    artist: "Peter Paul Rubens",
    year: "c. 1609–1610",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_Samson_and_Delilah_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Peter_Paul_Rubens_-_Samson_and_Delilah_-_Google_Art_Project.jpg/960px-Peter_Paul_Rubens_-_Samson_and_Delilah_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Satan Smiting Job with Sore Boils",
    artist: "William Blake",
    year: "c. 1826",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:William_Blake_-_Satan_Smiting_Job_with_Sore_Boils_-_Google_Art_Project.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/William_Blake_-_Satan_Smiting_Job_with_Sore_Boils_-_Google_Art_Project.jpg/960px-William_Blake_-_Satan_Smiting_Job_with_Sore_Boils_-_Google_Art_Project.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Sermon on the Mount",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Dore_Bible_Sermon_on_the_Mount.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dore_Bible_Sermon_on_the_Mount.jpg/960px-Dore_Bible_Sermon_on_the_Mount.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Seven Trumpets",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_7.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/D%C3%BCrer_Apocalypse_7.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Seventh Plague of Egypt",
    artist: "John Martin",
    year: "1823",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Martin,_John_-_The_Seventh_Plague_-_1823.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Martin%2C_John_-_The_Seventh_Plague_-_1823.jpg/960px-Martin%2C_John_-_The_Seventh_Plague_-_1823.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "St. John Before God and the Elders",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_2.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/D%C3%BCrer_Apocalypse_2.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "St. John the Evangelist on Patmos",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_1.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c0/D%C3%BCrer_Apocalypse_1.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "St. Michael Fighting the Dragon",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_8.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/D%C3%BCrer_Apocalypse_8.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Vision of Ezekiel",
    artist: "Raphael",
    year: "1518",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:Raffaello_Sanzio_-_The_Vision_of_Ezekiel_-_WGA18874.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/Raffaello_Sanzio_-_The_Vision_of_Ezekiel_-_WGA18874.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Whore of Babylon",
    artist: "Albrecht Dürer",
    year: "1498",
    wikiUrl:
      "https://commons.wikimedia.org/wiki/File:D%C3%BCrer_Apocalypse_12.jpg",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6e/D%C3%BCrer_Apocalypse_12.jpg",
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Elohim Creating Adam",
    artist: "William Blake",
    year: "1795",
    wikiUrl: createCommonsFilePageUrl(
      "William Blake - Elohim Creating Adam - WGA2219.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "William Blake - Elohim Creating Adam - WGA2219.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Newton",
    artist: "William Blake",
    year: "1795–1805",
    wikiUrl: createCommonsFilePageUrl("Newton-WilliamBlake.jpg"),
    imageUrl: createCommonsFilePathUrl("Newton-WilliamBlake.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Urizen",
    artist: "William Blake",
    year: "c. 1818",
    wikiUrl: createCommonsFilePageUrl("Urizen by William Blake.jpg"),
    imageUrl: createCommonsFilePathUrl("Urizen by William Blake.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Los",
    artist: "William Blake",
    year: "c. 1804–1820",
    wikiUrl: createCommonsFilePageUrl("William Blake - Los - WGA02222.jpg"),
    imageUrl: createCommonsFilePathUrl("William Blake - Los - WGA02222.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Birth of the Sons of Urizen",
    artist: "William Blake",
    year: "c. 1794",
    wikiUrl: createCommonsFilePageUrl("Birth of the sons of urizen.jpg"),
    imageUrl: createCommonsFilePathUrl("Birth of the sons of urizen.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Ghost of a Flea",
    artist: "William Blake",
    year: "c. 1819",
    wikiUrl: createCommonsFilePageUrl(
      "William Blake - The Ghost of a Flea - Google Art Project.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "William Blake - The Ghost of a Flea - Google Art Project.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Body of Abel Found by Adam and Eve",
    artist: "William Blake",
    year: "c. 1826",
    wikiUrl: createCommonsFilePageUrl(
      "The Body of Abel Found by Adam and Eve by William Blake c1826 Tate.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "The Body of Abel Found by Adam and Eve by William Blake c1826 Tate.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Four Zoas",
    artist: "William Blake",
    year: "c. 1811",
    wikiUrl: createCommonsFilePageUrl("The Four Zoas.jpg"),
    imageUrl: createCommonsFilePathUrl("The Four Zoas.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The First Book of Urizen, Plate 1",
    artist: "William Blake",
    year: "c. 1818",
    wikiUrl: createCommonsFilePageUrl(
      `William Blake - The First Book of Urizen, Plate 1, "The First Book of Urizen." (Bentley 1) - Google Art Project (2385714).jpg`,
    ),
    imageUrl: createCommonsFilePathUrl(
      `William Blake - The First Book of Urizen, Plate 1, "The First Book of Urizen." (Bentley 1) - Google Art Project (2385714).jpg`,
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The First Book of Urizen, Plate 2",
    artist: "William Blake",
    year: "c. 1818",
    wikiUrl: createCommonsFilePageUrl(
      `William Blake - The First Book of Urizen, Plate 2, "Preludium to the Book of Urizen" (Bentley 2a) - Google Art Project.jpg`,
    ),
    imageUrl: createCommonsFilePathUrl(
      `William Blake - The First Book of Urizen, Plate 2, "Preludium to the Book of Urizen" (Bentley 2a) - Google Art Project.jpg`,
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Ecce Homo",
    artist: "Antonio Ciseri",
    year: "1871–1888",
    wikiUrl: createCommonsFilePageUrl("Antonio Ciseri - Ecce Homo.jpg"),
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9a/Antonio_Ciseri_-_Ecce_Homo.jpg",
    createdAt: "2026-04-29T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Fallen Angel",
    artist: "Alexandre Cabanel",
    year: "1847",
    wikiUrl: createCommonsFilePageUrl("The_Fallen_Angel.jpg"),
    imageUrl: createCommonsFilePathUrl("The_Fallen_Angel.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_fallen_angel_cabanel",
      "/cards/enemy_fallen_angel_cabanel",
    ],
  },
  {
    title: "Satan as the Fallen Angel",
    artist: "Sir Thomas Lawrence",
    year: "c. 1797",
    wikiUrl: createCommonsFilePageUrl(
      "'Satan as the Fallen Angel' by Sir Thomas Lawrence, chalk.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "'Satan as the Fallen Angel' by Sir Thomas Lawrence, chalk.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_satan_as_the_fallen_angel",
      "/cards/enemy_satan_as_the_fallen_angel",
    ],
  },
  {
    title: "Satan Exulting over Eve",
    artist: "William Blake",
    year: "1795",
    wikiUrl: createCommonsFilePageUrl("Satan_Exulting_over_Eve.jpg"),
    imageUrl: createCommonsFilePathUrl("Satan_Exulting_over_Eve.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_satan_exulting_over_eve",
      "/cards/enemy_satan_exulting_over_eve",
    ],
  },
  {
    title: "Satan Calling Up His Legions",
    artist: "William Blake",
    year: "1804",
    wikiUrl: createCommonsFilePageUrl("Satan_Calling_up_his_legions.jpg"),
    imageUrl: createCommonsFilePathUrl("Satan_Calling_up_his_legions.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_satan_calling_up_his_legions",
      "/cards/enemy_satan_calling_up_his_legions",
    ],
  },
  {
    title: "The Casting of the Rebel Angels into Hell",
    artist: "William Blake",
    year: "1808",
    wikiUrl: createCommonsFilePageUrl(
      "William Blake, The Casting of the Rebel Angels into Hell.JPG",
    ),
    imageUrl: createCommonsFilePathUrl(
      "William Blake, The Casting of the Rebel Angels into Hell.JPG",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: ["/cards/gallery_casting_the_rebel_angels_into_hell"],
  },
  {
    title: "The Great Red Dragon and the Beast from the Sea",
    artist: "William Blake",
    year: "c. 1805",
    wikiUrl: createCommonsFilePageUrl(
      "William Blake, The Great Red Dragon and the Beast from the Sea, c. 1805, NGA 11499.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "William Blake, The Great Red Dragon and the Beast from the Sea, c. 1805, NGA 11499.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_great_red_dragon_beast_from_sea",
      "/cards/enemy_great_red_dragon_beast_from_sea",
    ],
  },
  {
    title: "The Number of the Beast is 666",
    artist: "William Blake",
    year: "1805",
    wikiUrl: createCommonsFilePageUrl(
      "The number of the beast is 666 Philadelphia, Rosenbach Museum and Library.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "The number of the beast is 666 Philadelphia, Rosenbach Museum and Library.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_number_of_the_beast_666",
      "/cards/enemy_number_of_the_beast_666",
    ],
  },
  {
    title: "The Fall of the Rebel Angels",
    artist: "Lucas Emil Vorsterman after Peter Paul Rubens",
    year: "1621",
    wikiUrl: createCommonsFilePageUrl("The_Fall_of_the_Rebel_Angels,_1621.jpg"),
    imageUrl: createCommonsFilePathUrl(
      "The_Fall_of_the_Rebel_Angels,_1621.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: ["/cards/gallery_fall_of_the_rebel_angels_rubens"],
  },
  {
    title: "The Triumph of Death",
    artist: "Pieter Bruegel the Elder",
    year: "c. 1562",
    wikiUrl: createCommonsFilePageUrl(
      "The_Triumph_of_Death_by_Pieter_Bruegel_the_Elder.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "The_Triumph_of_Death_by_Pieter_Bruegel_the_Elder.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_triumph_of_death",
      "/cards/enemy_triumph_of_death",
    ],
  },
  {
    title: "The Temptation of St Anthony",
    artist: "Hieronymus Bosch",
    year: "c. 1500",
    wikiUrl: createCommonsFilePageUrl(
      "Hieronymus Bosch The Temptation of St Anthony.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Hieronymus Bosch The Temptation of St Anthony.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: ["/cards/gallery_temptation_of_st_anthony_bosch"],
  },
  {
    title: "Garden of Earthly Delights - Hell Detail",
    artist: "Hieronymus Bosch",
    year: "c. 1490–1505",
    wikiUrl: createCommonsFilePageUrl(
      "Hieronymus Bosch - The Garden of Earthly Delights - Hell Detail.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Hieronymus Bosch - The Garden of Earthly Delights - Hell Detail.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_garden_of_earthly_delights_hell_detail",
      "/cards/enemy_garden_of_earthly_delights_hell_detail",
    ],
  },
  {
    title: "Pandemonium",
    artist: "John Martin",
    year: "1841",
    wikiUrl: createCommonsFilePageUrl("Pandemonium.jpg"),
    imageUrl: createCommonsFilePathUrl("Pandemonium.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: ["/cards/gallery_pandemonium_john_martin"],
  },
  {
    title: "Medusa",
    artist: "Caravaggio",
    year: "1597",
    wikiUrl: createCommonsFilePageUrl("Medusa-Caravaggio_(Uffizi).jpg"),
    imageUrl: createCommonsFilePathUrl("Medusa-Caravaggio_(Uffizi).jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_medusa_caravaggio",
      "/cards/enemy_medusa_caravaggio",
    ],
  },
  {
    title: "Saturn Devouring His Son",
    artist: "Francisco de Goya",
    year: "1820–1823",
    wikiUrl: createCommonsFilePageUrl("Saturn_Devouring_His_Son.jpg"),
    imageUrl: createCommonsFilePathUrl("Saturn_Devouring_His_Son.jpg"),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_saturn_devouring_his_son_goya",
      "/cards/enemy_saturn_devouring_his_son_goya",
    ],
  },
  {
    title: "The Rebel Angel",
    artist: "Nicholas Kalmakoff",
    year: "1924",
    wikiUrl: createCommonsFilePageUrl(
      "L’ange rebelle (The Rebel Angel) (1924) - Nikolai Kalmakov.jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "L’ange rebelle (The Rebel Angel) (1924) - Nikolai Kalmakov.jpg",
    ),
    createdAt: "2026-04-28T00:00:00-05:00",
    cardUsed: [
      "/cards/gallery_rebel_angel_kalmakov",
      "/cards/enemy_rebel_angel",
    ],
  },
  {
    title: "The Birth of Venus",
    artist: "Sandro Botticelli",
    year: "c. 1485",
    wikiUrl: createCommonsFilePageUrl("Botticelli Venus.jpg"),
    imageUrl: createCommonsFilePathUrl("Botticelli Venus.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Triumph of Galatea",
    artist: "Raphael",
    year: "c. 1512",
    wikiUrl: createCommonsFilePageUrl("Galatea Raphael.jpg"),
    imageUrl: createCommonsFilePathUrl("Galatea Raphael.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Bacchus and Ariadne",
    artist: "Titian",
    year: "1520-1523",
    wikiUrl: createCommonsFilePageUrl("Titian Bacchus and Ariadne.jpg"),
    imageUrl: createCommonsFilePathUrl("Titian Bacchus and Ariadne.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jupiter and Io",
    artist: "Antonio da Correggio",
    year: "c. 1530",
    wikiUrl: createCommonsFilePageUrl("Correggio - Jupiter and Io - WGA05344.jpg"),
    imageUrl: createCommonsFilePathUrl("Correggio - Jupiter and Io - WGA05344.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Mars and Venus",
    artist: "Paolo Veronese",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl("Mars and Venus (SM 893).png"),
    imageUrl: createCommonsFilePathUrl("Mars and Venus (SM 893).png"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Fall of Phaeton",
    artist: "Peter Paul Rubens",
    year: "c. 1604-1605",
    wikiUrl: createCommonsFilePageUrl(
      "Peter Paul Rubens - The Fall of Phaeton (National Gallery of Art).jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Peter Paul Rubens - The Fall of Phaeton (National Gallery of Art).jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Venus and Adonis",
    artist: "Peter Paul Rubens",
    year: "first half of 17th century",
    wikiUrl: createCommonsFilePageUrl("Rubens - Venus and Adonis.jpg"),
    imageUrl: createCommonsFilePathUrl("Rubens - Venus and Adonis.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jupiter and Semele",
    artist: "Jacopo Tintoretto",
    year: "1545",
    wikiUrl: createCommonsFilePageUrl("Jacopo Tintoretto - Jupiter and Semele, 1545.jpg"),
    imageUrl: createCommonsFilePathUrl(
      "Jacopo Tintoretto - Jupiter and Semele, 1545.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Rape of Europa",
    artist: "Paolo Veronese",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl("Veronese - Rape of Europa - Google Art Project.jpg"),
    imageUrl: createCommonsFilePathUrl(
      "Veronese - Rape of Europa - Google Art Project.jpg",
    ),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Apollo and Daphne",
    artist: "Nicolas Poussin",
    year: "c. 1627",
    wikiUrl: createCommonsFilePageUrl("Poussin Apollo and Daphne.jpg"),
    imageUrl: createCommonsFilePathUrl("Poussin Apollo and Daphne.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Adoration of the Magi",
    artist: "Gentile da Fabriano",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Gentile_da_Fabriano_-_Adorazione_dei_Magi_-_Google_Art_ProjectFXD.jpg"),
    imageUrl: createCommonsFilePathUrl("Gentile_da_Fabriano_-_Adorazione_dei_Magi_-_Google_Art_ProjectFXD.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Calling of Saint Matthew",
    artist: "Theodoor van Loon",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Loon_Calling_of_Saint_Matthew.jpg"),
    imageUrl: createCommonsFilePathUrl("Loon_Calling_of_Saint_Matthew.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ and the Samaritan Woman at the Well",
    artist: "Giuseppe Passeri",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Christ_and_the_Samaritan_Woman_at_the_Well._MET_DP810988.jpg"),
    imageUrl: createCommonsFilePathUrl("Christ_and_the_Samaritan_Woman_at_the_Well._MET_DP810988.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ before Caiaphas",
    artist: "Sebald Beham",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Sebald_Beham,_Christ_before_Caiaphas,_1535,_NGA_4367.jpg"),
    imageUrl: createCommonsFilePathUrl("Sebald_Beham,_Christ_before_Caiaphas,_1535,_NGA_4367.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ before Pilate",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("TissotPilate.JPG"),
    imageUrl: createCommonsFilePathUrl("TissotPilate.JPG"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Crowned with Thorns",
    artist: "Guercino",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Guercino-Christ_Crowned_With_Thorns.jpg"),
    imageUrl: createCommonsFilePathUrl("Guercino-Christ_Crowned_With_Thorns.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Driving the Money-changers from the Temple",
    artist: "Rembrandt",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg"),
    imageUrl: createCommonsFilePathUrl("Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Feeding the Multitude",
    artist: "Gustave Dore",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("JesusFeedingMultitude.jpg"),
    imageUrl: createCommonsFilePathUrl("JesusFeedingMultitude.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ Healing the Blind",
    artist: "El Greco",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("El_Greco_(Doménikos_Theotokópoulos)_(1541–1614),_Christ_Healing_the_Blind,_c._1570.jpg"),
    imageUrl: createCommonsFilePathUrl("El_Greco_(Doménikos_Theotokópoulos)_(1541–1614),_Christ_Healing_the_Blind,_c._1570.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ in the House of Martha and Mary",
    artist: "Charles de La Fosse",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Christ_in_the_House_of_Martha_and_Mary(113520).jpg"),
    imageUrl: createCommonsFilePathUrl("Christ_in_the_House_of_Martha_and_Mary(113520).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Christ on the Mount of Olives",
    artist: "Albrecht Durer",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Albrecht_Dürer,_Christ_on_the_Mount_of_Olives,_c._1497-1499,_NGA_6686.jpg"),
    imageUrl: createCommonsFilePathUrl("Albrecht_Dürer,_Christ_on_the_Mount_of_Olives,_c._1497-1499,_NGA_6686.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Entombment of Christ",
    artist: "Albrecht Durer",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Durer_Entombment_of_Christ.jpg"),
    imageUrl: createCommonsFilePathUrl("Durer_Entombment_of_Christ.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Healing of the Lepers at Capernaum",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Healing_of_the_Lepers_at_Capernaum_(Guérison_des_lépreux_à_Capernaum)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Healing_of_the_Lepers_at_Capernaum_(Guérison_des_lépreux_à_Capernaum)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Herod",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Herod_tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Herod_tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Image of the Sower Parable",
    artist: "Alexandre Bida",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Parable_Sower.jpg"),
    imageUrl: createCommonsFilePathUrl("Parable_Sower.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Interview between Jesus and Nicodemus",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Interview_between_Jesus_and_Nicodemus_(Entretien_de_Jésus_et_de_Nicodème)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Interview_between_Jesus_and_Nicodemus_(Entretien_de_Jésus_et_de_Nicodème)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "It Is Finished",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_It_Is_Finished_(Consummatum_Est)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_It_Is_Finished_(Consummatum_Est)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jerusalem From The Mount Of Olives",
    artist: "Gustav Bauernfeind",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("JERUSALEM_FROM_THE_MOUNT_OF_OLIVES_).jpg"),
    imageUrl: createCommonsFilePathUrl("JERUSALEM_FROM_THE_MOUNT_OF_OLIVES_).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jerusalem Jerusalem",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Jerusalem_Jerusalem_(Jérusalem_Jérusalem)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Jerusalem_Jerusalem_(Jérusalem_Jérusalem)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus Anointing",
    artist: "Alexander Bida",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Jesus_Anointing.jpg"),
    imageUrl: createCommonsFilePathUrl("Jesus_Anointing.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Jesus before Caiaphas",
    artist: "Wenceslaus Hollar",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Jesus_before_Caiaphas_MET_DP822864.jpg"),
    imageUrl: createCommonsFilePathUrl("Jesus_before_Caiaphas_MET_DP822864.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Judas Repentant, Returning the Pieces of Silver",
    artist: "Rembrandt",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Judas_Returning_the_Thirty_Silver_Pieces_-_Rembrandt.jpg"),
    imageUrl: createCommonsFilePathUrl("Judas_Returning_the_Thirty_Silver_Pieces_-_Rembrandt.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Mary Magdalene and the Holy Women at the Tomb",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Mary_Magdalene_and_the_Holy_Women_at_the_Tomb_(Madeleine_et_les_saintes_femmes_au_tombeau)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Mary_Magdalene_and_the_Holy_Women_at_the_Tomb_(Madeleine_et_les_saintes_femmes_au_tombeau)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Our Lord Jesus Christ",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Our_Lord_Jesus_Christ_(Notre-Seigneur_Jésus-Christ)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Our_Lord_Jesus_Christ_(Notre-Seigneur_Jésus-Christ)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Parable of the Lost Sheep",
    artist: "Jan Luyken",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Teachings_of_Jesus_14_of_40._parable_of_the_lost_sheep._Jan_Luyken_etching._Bowyer_Bible.gif"),
    imageUrl: createCommonsFilePathUrl("Teachings_of_Jesus_14_of_40._parable_of_the_lost_sheep._Jan_Luyken_etching._Bowyer_Bible.gif"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Parable of the Mustard Seed",
    artist: "Jan Luyken",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Teachings_of_Jesus_5_of_40._parable_of_the_mustard_seed._Jan_Luyken_etching._Bowyer_Bible.gif"),
    imageUrl: createCommonsFilePathUrl("Teachings_of_Jesus_5_of_40._parable_of_the_mustard_seed._Jan_Luyken_etching._Bowyer_Bible.gif"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Pool of Bethesda",
    artist: "L. Maier",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Pool_of_Bethesda.jpg"),
    imageUrl: createCommonsFilePathUrl("Pool_of_Bethesda.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Ruins of Capernaum in 1890",
    artist: "Unknown author",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Capernaum_1890.jpg"),
    imageUrl: createCommonsFilePathUrl("Capernaum_1890.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint Andrew",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Saint_Andrew_(Saint_André)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Saint_Andrew_(Saint_André)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint John the Evangelist",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Saint_John_the_Evangelist_(Saint_Jean_l'Évangeliste)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Saint_John_the_Evangelist_(Saint_Jean_l'Évangeliste)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint Longinus",
    artist: "Richard de Montbaston and collaborators",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Saint_Longinus.jpg"),
    imageUrl: createCommonsFilePathUrl("Saint_Longinus.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Saint Peter Walks on the Sea",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_Saint_Peter_Walks_on_the_Sea_(Saint_Pierre_marche_sur_la_mer)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_Saint_Peter_Walks_on_the_Sea_(Saint_Pierre_marche_sur_la_mer)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Shrine of the Annunciation, Nazareth",
    artist: "David Roberts",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Shrine_of_the_Annunciation_Nazareth_April_20th_1839_-_David_Roberts,_R.A._LCCN2002717479.jpg"),
    imageUrl: createCommonsFilePathUrl("Shrine_of_the_Annunciation_Nazareth_April_20th_1839_-_David_Roberts,_R.A._LCCN2002717479.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "Simon of Cyrene Carries the Cross",
    artist: "Theophile Marie Francois Lybaert",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Theophile_Lybaert_-_Simon_of_Cyrene_carries_the_cross.jpg"),
    imageUrl: createCommonsFilePathUrl("Theophile_Lybaert_-_Simon_of_Cyrene_carries_the_cross.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Adoration of the Shepherds",
    artist: "Giorgione",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Giorgione,_The_Adoration_of_the_Shepherds,_1505-1510,_NGA_432.jpg"),
    imageUrl: createCommonsFilePathUrl("Giorgione,_The_Adoration_of_the_Shepherds,_1505-1510,_NGA_432.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Annunciation",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Annunciation_(L'annonciation)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Annunciation_(L'annonciation)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Baptism of Christ in the River Jordan",
    artist: "Karoly Marko",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Markó,_Károly_-_The_Baptism_of_Christ_in_the_River_Jordan_(1840-1).jpg"),
    imageUrl: createCommonsFilePathUrl("Markó,_Károly_-_The_Baptism_of_Christ_in_the_River_Jordan_(1840-1).jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Grotto of the Agony",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Grotto_of_the_Agony_(La_Grotte_de_l'agonie)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Grotto_of_the_Agony_(La_Grotte_de_l'agonie)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Healing of the Paralytic",
    artist: "Netherlandish 16th Century",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("The_Healing_of_the_Paralytic_sc000456.jpg"),
    imageUrl: createCommonsFilePathUrl("The_Healing_of_the_Paralytic_sc000456.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Kiss of Judas",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Kiss_of_Judas_(Le_baiser_de_Judas)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Kiss_of_Judas_(Le_baiser_de_Judas)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Last Supper",
    artist: "Colijn de Coter",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Coter_Last_Supper.jpg"),
    imageUrl: createCommonsFilePathUrl("Coter_Last_Supper.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Lord is my Good Shepherd",
    artist: "Bernhard Plockhorst",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("The_Lord_is_my_Good_Shepherd.jpg"),
    imageUrl: createCommonsFilePathUrl("The_Lord_is_my_Good_Shepherd.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Miracle of the Loaves and Fishes",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_(La_multiplication_des_pains)_by_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_(La_multiplication_des_pains)_by_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Miraculous Draught of Fishes",
    artist: "Peter Paul Rubens",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Rubens_-_The_Miraculous_Draught_of_Fishes,_1618-19.jpg"),
    imageUrl: createCommonsFilePathUrl("Rubens_-_The_Miraculous_Draught_of_Fishes,_1618-19.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Parable of the Rich Fool",
    artist: "Rembrandt",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Rembrandt_-_The_Parable_of_the_Rich_Fool.jpg"),
    imageUrl: createCommonsFilePathUrl("Rembrandt_-_The_Parable_of_the_Rich_Fool.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Pharisee and the Publican",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Tissot_The_Pharisee_and_the_publican_Brooklyn.jpg"),
    imageUrl: createCommonsFilePathUrl("Tissot_The_Pharisee_and_the_publican_Brooklyn.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Pilgrims of Emmaus on the Road",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Pilgrims_of_Emmaus_on_the_Road_(Les_pèlerins_d'Emmaüs_en_chemin)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Pilgrims_of_Emmaus_on_the_Road_(Les_pèlerins_d'Emmaüs_en_chemin)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Primacy of Saint Peter",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Primacy_of_Saint_Peter_(La_primauté_de_Saint-Pierre)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Primacy_of_Saint_Peter_(La_primauté_de_Saint-Pierre)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Return of the Prodigal Son",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Return_of_the_Prodigal_Son_(Le_retour_de_l'enfant_prodigue)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Return_of_the_Prodigal_Son_(Le_retour_de_l'enfant_prodigue)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Storm on the Sea of Galilee",
    artist: "Rembrandt",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg"),
    imageUrl: createCommonsFilePathUrl("Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Third Denial of Peter. Jesus' Look of Reproach",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Third_Denial_of_Peter._Jesus'_Look_of_Reproach_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Third_Denial_of_Peter._Jesus'_Look_of_Reproach_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Transfiguration",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Transfiguration_(La_transfiguration)_-_James_Tissot_-_overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Transfiguration_(La_transfiguration)_-_James_Tissot_-_overall.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Wedding at Cana",
    artist: "Denys Calvaert",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("THE_WEDDING_AT_CANA.PNG"),
    imageUrl: createCommonsFilePathUrl("THE_WEDDING_AT_CANA.PNG"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "The Woman with an Issue of Blood",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_The_Woman_with_an_Issue_of_Blood_(L'hémoroïsse)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_The_Woman_with_an_Issue_of_Blood_(L'hémoroïsse)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
  {
    title: "What Our Lord Saw from the Cross",
    artist: "James Tissot",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_(Ce_que_voyait_Notre-Seigneur_sur_la_Croix)_-_James_Tissot.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_(Ce_que_voyait_Notre-Seigneur_sur_la_Croix)_-_James_Tissot.jpg"),
    createdAt: "2026-04-30T00:00:00-05:00",
    cardUsed: [],
  },
];
