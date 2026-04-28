export type GalleryEntry = {
  title: string;
  artist: string;
  year: string;
  wikiUrl: string;
  imageUrl: string;
  createdAt: string;
  cardUsed: string[];
};

type GalleryEntryBase = Omit<GalleryEntry, "createdAt" | "cardUsed">;

function createCommonsFilePageUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`;
}

function createCommonsFilePathUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

function getGalleryCreatedAt(index: number): string {
  if (index < 10) {
    return "2026-04-27T22:20:25-05:00";
  }

  if (index < 20) {
    return "2026-04-27T22:26:33-05:00";
  }

  if (index < 32) {
    return "2026-04-27T22:45:30-05:00";
  }

  return "2026-04-28T00:00:00-05:00";
}

function getGalleryCardUsed(index: number): string[] {
  switch (index) {
    case 0:
      return ["/cards/gallery_ancient_of_days"];
    case 1:
      return ["/cards/gallery_angel_stopping_abraham"];
    case 2:
      return ["/cards/gallery_annunciation"];
    case 3:
      return ["/cards/gallery_belshazzars_feast"];
    case 4:
      return ["/cards/gallery_christ_and_mary_magdalen"];
    case 5:
      return ["/cards/gallery_creation_of_adam"];
    case 6:
      return ["/cards/gallery_deluge"];
    case 7:
      return ["/cards/gallery_great_day_of_his_wrath"];
    case 8:
      return ["/cards/gallery_great_red_dragon"];
    case 9:
      return ["/cards/gallery_jacob_wrestles_with_the_angel"];
    case 10:
      return ["/cards/gallery_joshua_commanding_the_sun_to_stand_still_upon_gibeon"];
    case 11:
      return ["/cards/gallery_last_judgment"];
    case 12:
      return ["/cards/gallery_last_supper"];
    case 13:
      return ["/cards/gallery_opening_of_the_fifth_seal"];
    case 14:
      return ["/cards/gallery_plains_of_heaven"];
    case 15:
      return ["/cards/gallery_sacrifice_of_isaac"];
    case 16:
      return ["/cards/gallery_saint_michael_vanquishing_satan"];
    case 17:
      return ["/cards/gallery_satan_in_cocytus"];
    case 18:
      return ["/cards/gallery_sodom_and_gomorrah"];
    case 19:
      return ["/cards/gallery_tower_of_babel"];
    case 20:
      return ["/cards/gallery_transfiguration"];
    case 21:
      return ["/cards/gallery_triumph_of_christianity_over_paganism"];
    case 22:
      return ["/cards/gallery_woman_taken_in_adultery"];
    default:
      return [];
  }
}

const GALLERY_BASE: GalleryEntryBase[] = [
  {
    title: "The Ancient of Days",
    artist: "William Blake",
    year: "1794",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:The_Ancient_of_Days_(Blake,_Research_Issues).jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
  },
  {
    title: "The Angel Stopping Abraham",
    artist: "Rembrandt van Rijn",
    year: "1635",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son,_Isaac.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
  },
  {
    title: "The Annunciation",
    artist: "Fra Angelico",
    year: "c. 1440–1445",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
  },
  {
    title: "Belshazzar's Feast",
    artist: "John Martin",
    year: "1820",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg/960px-John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
  },
  {
    title: "Christ and St Mary Magdalen at the Tomb",
    artist: "Rembrandt van Rijn",
    year: "1638",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg/960px-Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
  },
  {
    title: "The Creation of Adam",
    artist: "Michelangelo",
    year: "c. 1508–1512",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  },
  {
    title: "The Deluge",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/960px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
  },
  {
    title: "The Great Day of His Wrath",
    artist: "John Martin",
    year: "1853",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
  },
  {
    title: "The Great Red Dragon",
    artist: "William Blake",
    year: "c. 1805",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg/960px-William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg",
  },
  {
    title: "Jacob Wrestles with the Angel",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:024.Jacob_Wrestles_with_the_Angel.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/024.Jacob_Wrestles_with_the_Angel.jpg/960px-024.Jacob_Wrestles_with_the_Angel.jpg",
  },
  {
    title: "Joshua Commanding the Sun to Stand Still upon Gibeon",
    artist: "John Martin",
    year: "1816",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_(1816)_John_Martin_-_NGA_2004.64.1.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg/960px-Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg",
  },
  {
    title: "The Last Judgment",
    artist: "Hieronymus Bosch",
    year: "c. 1482",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Hieronymus_Bosch_-_The_Last_Judgement.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Hieronymus_Bosch_-_The_Last_Judgement.jpg/960px-Hieronymus_Bosch_-_The_Last_Judgement.jpg",
  },
  {
    title: "The Last Supper",
    artist: "Jacopo Tintoretto",
    year: "1592–1594",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg/960px-Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
  },
  {
    title: "The Opening of the Fifth Seal",
    artist: "El Greco",
    year: "c. 1608–1614",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:El_Greco_-_The_Opening_of_the_Fifth_Seal_(The_Vision_of_St_John)_-_WGA10637.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg/960px-El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg",
  },
  {
    title: "The Plains of Heaven",
    artist: "John Martin",
    year: "1851",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg",
  },
  {
    title: "The Sacrifice of Isaac",
    artist: "Caravaggio",
    year: "c. 1603",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Sacrifice_of_Isaac-Caravaggio_(Uffizi).jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg/960px-Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg",
  },
  {
    title: "Saint Michael Vanquishing Satan",
    artist: "Raphael",
    year: "1518",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/Raphael_-_St._Michael_Vanquishing_Satan.jpg",
  },
  {
    title: "Satan in Cocytus",
    artist: "Gustave Doré",
    year: "1861",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_Inferno34.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gustave_Dore_Inferno34.jpg/960px-Gustave_Dore_Inferno34.jpg",
  },
  {
    title: "Sodom and Gomorrah",
    artist: "John Martin",
    year: "1852",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:John_Martin_-_Sodom_and_Gomorrah.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/John_Martin_-_Sodom_and_Gomorrah.jpg/960px-John_Martin_-_Sodom_and_Gomorrah.jpg",
  },
  {
    title: "The Tower of Babel",
    artist: "Gustave Doré",
    year: "1865",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
  },
  {
    title: "The Transfiguration",
    artist: "Raphael",
    year: "1516–1520",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Transfiguration_Raphael.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Transfiguration_Raphael.jpg/960px-Transfiguration_Raphael.jpg",
  },
  {
    title: "The Triumph of Christianity Over Paganism",
    artist: "Gustave Doré",
    year: "1868",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg/960px-The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg",
  },
  {
    title: "The Woman Taken in Adultery",
    artist: "Rembrandt van Rijn",
    year: "1644",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg/960px-Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg",
  },
  {
    title: "Christ in the Storm on the Sea of Galilee",
    artist: "Rembrandt van Rijn",
    year: "1633",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
  },
  {
    title: "Christ Driving the Money Changers from the Temple",
    artist: "Rembrandt van Rijn",
    year: "1626",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_Christ_Driving_the_Money_Changers_from_the_Temple.jpg",
  },
  {
    title: "The Baptism of Jesus",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Baptism_of_Jesus_(Bapt%C3%AAme_de_J%C3%A9sus)_-_James_Tissot_-_overall.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Baptism_of_Jesus_(Bapt%C3%AAme_de_J%C3%A9sus)_-_James_Tissot_-_overall.jpg",
  },
  {
    title: "The Good Samaritan",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Good_Samaritan_(Le_bon_samaritain)_-_James_Tissot.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Good_Samaritan_(Le_bon_samaritain)_-_James_Tissot.jpg",
  },
  {
    title: "The Flight into Egypt",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Flight_into_Egypt_(La_fuite_en_%C3%89gypte)_-_James_Tissot_-_overall.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Flight_into_Egypt_(La_fuite_en_%C3%89gypte)_-_James_Tissot_-_overall.jpg",
  },
  {
    title: "The Visitation",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Visitation_(La_visitation)_-_James_Tissot_-_overall.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Visitation_(La_visitation)_-_James_Tissot_-_overall.jpg",
  },
  {
    title: "Jesus Appears to Mary Magdalene",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
  },
  {
    title: "The Resurrection of Lazarus",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Resurrection_of_Lazarus_(La_r%C3%A9surrection_de_Lazare)_-_James_Tissot.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Resurrection_of_Lazarus_(La_r%C3%A9surrection_de_Lazare)_-_James_Tissot.jpg",
  },
  {
    title: "The Incredulity of Saint Thomas",
    artist: "Caravaggio",
    year: "1601–1602",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:The_Incredulity_of_Saint_Thomas.jpg",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Incredulity_of_Saint_Thomas.jpg",
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
  },
  {
    title: "Saint Joseph",
    artist: "James Tissot",
    year: "c. 1886–1894",
    wikiUrl: createCommonsFilePageUrl("Brooklyn Museum - Saint Joseph - James Tissot - overall.jpg"),
    imageUrl: createCommonsFilePathUrl("Brooklyn Museum - Saint Joseph - James Tissot - overall.jpg"),
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
  },
  {
    title: "Pietà",
    artist: "Michelangelo",
    year: "c. 1498–1499",
    wikiUrl: createCommonsFilePageUrl("La Pietà.jpg"),
    imageUrl: createCommonsFilePathUrl("La Pietà.jpg"),
  },
  {
    title: "David",
    artist: "Michelangelo",
    year: "1501–1504",
    wikiUrl: createCommonsFilePageUrl("Statue of David - Michelangelo.JPG"),
    imageUrl: createCommonsFilePathUrl("Statue of David - Michelangelo.JPG"),
  },
  {
    title: "Moses",
    artist: "Michelangelo",
    year: "c. 1513–1515",
    wikiUrl: createCommonsFilePageUrl("Moses-by-Michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Moses-by-Michelangelo.jpg"),
  },
  {
    title: "Rebellious Slave",
    artist: "Michelangelo",
    year: "c. 1513–1516",
    wikiUrl: createCommonsFilePageUrl("Rebellious Slave (Michelangelo).jpg"),
    imageUrl: createCommonsFilePathUrl("Rebellious Slave (Michelangelo).jpg"),
  },
  {
    title: "Dying Slave",
    artist: "Michelangelo",
    year: "c. 1513–1516",
    wikiUrl: createCommonsFilePageUrl("Dying Slave Michelangelo JBU067.jpg"),
    imageUrl: createCommonsFilePathUrl("Dying Slave Michelangelo JBU067.jpg"),
  },
  {
    title: "The Last Judgment (Michelangelo)",
    artist: "Michelangelo",
    year: "1536–1541",
    wikiUrl: createCommonsFilePageUrl("Last Judgement by Michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Last Judgement by Michelangelo.jpg"),
  },
  {
    title: "Separation of Light from Darkness",
    artist: "Michelangelo",
    year: "c. 1511–1512",
    wikiUrl: createCommonsFilePageUrl("Michelangelo, Separation of Light from Darkness 00.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo, Separation of Light from Darkness 00.jpg"),
  },
  {
    title: "The Creation of Eve",
    artist: "Michelangelo",
    year: "1511",
    wikiUrl: createCommonsFilePageUrl("Creation of Eve, michelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("Creation of Eve, michelangelo.jpg"),
  },
  {
    title: "The Fall and Expulsion from Paradise",
    artist: "Michelangelo",
    year: "c. 1510–1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo, Fall and Expulsion from Garden of Eden 04.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo, Fall and Expulsion from Garden of Eden 04.jpg"),
  },
  {
    title: "Cumaean Sibyl",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("CumaeanSibylByMichelangelo.jpg"),
    imageUrl: createCommonsFilePathUrl("CumaeanSibylByMichelangelo.jpg"),
  },
  {
    title: "Libyan Sibyl",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo the libyan.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo the libyan.jpg"),
  },
  {
    title: "The Prophet Jonah",
    artist: "Michelangelo",
    year: "c. 1508–1512",
    wikiUrl: createCommonsFilePageUrl("Sistine jonah.jpg"),
    imageUrl: createCommonsFilePathUrl("Sistine jonah.jpg"),
  },
  {
    title: "Prophet Ezekiel",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo - Prophet Ezekiel.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo - Prophet Ezekiel.jpg"),
  },
  {
    title: "The Prophet Jeremiah",
    artist: "Michelangelo",
    year: "c. 1511",
    wikiUrl: createCommonsFilePageUrl("Michelangelo, profeti, Jeremiah 01.jpg"),
    imageUrl: createCommonsFilePathUrl("Michelangelo, profeti, Jeremiah 01.jpg"),
  },
  {
    title: "The Prophet Isaiah",
    artist: "Michelangelo",
    year: "c. 1511–1512",
    wikiUrl: createCommonsFilePageUrl("'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36FXD.jpg"),
    imageUrl: createCommonsFilePathUrl("'Isaiah Sistine Chapel ceiling' by Michelangelo JBU36FXD.jpg"),
  },
  {
    title: "Christ Pantocrator",
    artist: "Unknown",
    year: "19th century",
    wikiUrl: createCommonsFilePageUrl("Christ Pantocrator icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Christ Pantocrator icon.jpg"),
  },
  {
    title: "Nativity of Jesus",
    artist: "Unknown",
    year: "before 20th century",
    wikiUrl: createCommonsFilePageUrl("031 Nativity of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
    imageUrl: createCommonsFilePathUrl("031 Nativity of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
  },
  {
    title: "Theotokos of Vladimir",
    artist: "Anonymous",
    year: "12th century",
    wikiUrl: createCommonsFilePageUrl("Virgin of Vladimir.jpg"),
    imageUrl: createCommonsFilePathUrl("Virgin of Vladimir.jpg"),
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
  },
  {
    title: "Dormition of the Theotokos",
    artist: "Unknown",
    year: "19th century",
    wikiUrl: createCommonsFilePageUrl("Dormition-of-the-Theotokos Icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Dormition-of-the-Theotokos Icon.jpg"),
  },
  {
    title: "Dormition of the Theotokos",
    artist: "Unknown",
    year: "medieval",
    wikiUrl: createCommonsFilePageUrl("Dormition icon detail.jpg"),
    imageUrl: createCommonsFilePathUrl("Dormition icon detail.jpg"),
  },
  {
    title: "Annunciation",
    artist: "Wikivorker",
    year: "2024",
    wikiUrl: createCommonsFilePageUrl("Annunciation. Orthodox icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Annunciation. Orthodox icon.jpg"),
  },
  {
    title: "Baptism of Christ",
    artist: "Athanasios Margaritis",
    year: "1850",
    wikiUrl: createCommonsFilePageUrl("019 Baptism of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
    imageUrl: createCommonsFilePathUrl("019 Baptism of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
  },
  {
    title: "Crucifixion of Jesus",
    artist: "Unknown",
    year: "1855",
    wikiUrl: createCommonsFilePageUrl("024 Crucifixion of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
    imageUrl: createCommonsFilePathUrl("024 Crucifixion of Jesus Icon from Saint Paraskevi Church in Langadas.jpg"),
  },
  {
    title: "The Mystical Last Supper",
    artist: "Anonymous",
    year: "1497",
    wikiUrl: createCommonsFilePageUrl("Icon last supper.jpg"),
    imageUrl: createCommonsFilePathUrl("Icon last supper.jpg"),
  },
  {
    title: "Descent into Hell",
    artist: "Unknown",
    year: "pre-20th century",
    wikiUrl: createCommonsFilePageUrl("III Descent into Hell.jpg"),
    imageUrl: createCommonsFilePathUrl("III Descent into Hell.jpg"),
  },
  {
    title: "The Ascension",
    artist: "Unknown",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl("Ascension icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Ascension icon.jpg"),
  },
  {
    title: "Entry into Jerusalem",
    artist: "Unknown",
    year: "unknown",
    wikiUrl: createCommonsFilePageUrl("Entry into Jerusalem.jpg"),
    imageUrl: createCommonsFilePathUrl("Entry into Jerusalem.jpg"),
  },
  {
    title: "The Trinity",
    artist: "Andrei Rublev",
    year: "early 15th century",
    wikiUrl: createCommonsFilePageUrl("Andrey Rublev - Св. Троица - Google Art Project.jpg"),
    imageUrl: createCommonsFilePathUrl("Andrey Rublev - Св. Троица - Google Art Project.jpg"),
  },
  {
    title: "The Transfiguration",
    artist: "Unknown",
    year: "1516",
    wikiUrl: createCommonsFilePageUrl(
      "Icon of transfiguration (Spaso-Preobrazhensky Monastery, Yaroslavl).jpg",
    ),
    imageUrl: createCommonsFilePathUrl(
      "Icon of transfiguration (Spaso-Preobrazhensky Monastery, Yaroslavl).jpg",
    ),
  },
  {
    title: "The Transfiguration",
    artist: "Theophanes the Cretan",
    year: "16th century",
    wikiUrl: createCommonsFilePageUrl("Icon of the Transfiguration by Theophanes the Cretan.jpg"),
    imageUrl: createCommonsFilePathUrl("Icon of the Transfiguration by Theophanes the Cretan.jpg"),
  },
  {
    title: "Archangel Michael",
    artist: "Unknown",
    year: "13th century",
    wikiUrl: createCommonsFilePageUrl("Mikharkhangel.jpg"),
    imageUrl: createCommonsFilePathUrl("Mikharkhangel.jpg"),
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
  },
  {
    title: "Archangel Michael",
    artist: "DKjellby",
    year: "2023",
    wikiUrl: createCommonsFilePageUrl("Archangel Michael Serbian-Orthodox Icon.jpg"),
    imageUrl: createCommonsFilePathUrl("Archangel Michael Serbian-Orthodox Icon.jpg"),
  },
  {
    title: "Our Lady of the Sign",
    artist: "Unknown",
    year: "first half of 12th century",
    wikiUrl: createCommonsFilePageUrl("Orthodox icon of Our Lady of the Sign. Veliky Novgorod, Russia.jpg"),
    imageUrl: createCommonsFilePathUrl("Orthodox icon of Our Lady of the Sign. Veliky Novgorod, Russia.jpg"),
  },
];

export const GALLERY: GalleryEntry[] = GALLERY_BASE.map((entry, index) => ({
  ...entry,
  createdAt: getGalleryCreatedAt(index),
  cardUsed: getGalleryCardUsed(index),
}));
