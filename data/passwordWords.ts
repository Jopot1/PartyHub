export const PASSWORD_CATEGORIES = {
  MIX: "Tout mélangé",
  OBJECTS: "Objets",
  PLACES: "Lieux",
  CHARACTERS: "Personnages",
  POP_CULTURE: "Pop Culture",
  ADULT: "Adultes (18+)"
};

// Fallback lists used when AI is offline OR for specific categories (Adult)
export const PASSWORD_WORDS: Record<string, string[]> = {
  [PASSWORD_CATEGORIES.MIX]: [
    "Pizza", "Licorne", "Tour Eiffel", "Harry Potter", "Guitare", "Chocolat", "Vampire", "Pyramide", "Smartphone", "Batman",
    "Plage", "Dinosaure", "Napoléon", "Netflix", "Sushi", "Zidane", "Toilette", "Lasagne", "Internet", "Pikachu",
    "Mars", "Tracteur", "Titanic", "Mozart", "Kangourou", "Parapluie", "Youtube", "Fromage", "Ninja", "Croissant",
    "Dragon", "Volcan", "Cactus", "Squelette", "Piano", "Superman", "Ikea", "Shrek", "Banane", "Fusée",
    "Pingouin", "Mickey", "Star Wars", "Micro-ondes", "Zombie", "Football", "Barbie", "Jungle", "Paris", "Coca-Cola",
    "Spaghetti", "James Bond", "Château", "Aéroport", "Hélicoptère", "McDonald's", "Clown", "Fantôme", "Bébé", "Mariage",
    "Noël", "Halloween", "Plongée", "Boxe", "Camping", "Amazon", "Facebook", "Tiktok", "Loup", "Requin",
    "Panda", "Lion", "Tigre", "Aigle", "Dauphin", "Baleine", "Papillon", "Araignée", "Serpent", "Grenouille",
    "Robot", "Extraterrestre", "Momie", "Sorcière", "Fée", "Sirène", "Cyclope", "Minotaure", "Cerbère", "Griffon",
    "Zeus", "Thor", "Hercule", "Ulysse", "Achille", "Lancelot", "Arthur", "Merlin", "Excalibur", "Graal"
  ],
  [PASSWORD_CATEGORIES.OBJECTS]: [
    "Table", "Chaise", "Lampe", "Ordinateur", "Stylo", "Livre", "Bouteille", "Verre", "Assiette", "Fourchette",
    "Couteau", "Cuillère", "Poêle", "Casserole", "Frigo", "Four", "Micro-ondes", "Grille-pain", "Cafetière", "Télévision",
    "Canapé", "Lit", "Oreiller", "Couette", "Miroir", "Brosse à dents", "Savon", "Shampoing", "Serviette", "Peigne",
    "Rasoir", "Maquillage", "Parfum", "Bijou", "Montre", "Lunettes", "Chapeau", "Écharpe", "Gants", "Manteau",
    "Pantalon", "Chemise", "Robe", "Jupe", "Chaussures", "Chaussettes", "Sac", "Valise", "Parapluie", "Clef",
    "Porte-monnaie", "Carte bleue", "Téléphone", "Écouteurs", "Chargeur", "Batterie", "Pile", "Ampoule", "Prise", "Interrupteur",
    "Marteau", "Tournevis", "Clou", "Vis", "Scie", "Perceuse", "Pince", "Mètre", "Échelle", "Brouette",
    "Pelle", "Râteau", "Arrosoir", "Tondeuse", "Tuyau", "Pot", "Fleur", "Plante", "Arbre", "Banc"
  ],
  [PASSWORD_CATEGORIES.PLACES]: [
    "Paris", "Londres", "New York", "Tokyo", "Rome", "Venise", "Berlin", "Barcelone", "Madrid", "Lisbonne",
    "Moscou", "Pékin", "Shanghai", "Sydney", "Rio de Janeiro", "Le Caire", "Dubaï", "Mumbai", "Bangkok", "Singapour",
    "Los Angeles", "San Francisco", "Las Vegas", "Chicago", "Miami", "Toronto", "Montréal", "Vancouver", "Mexico", "Buenos Aires",
    "Lima", "Bogota", "Santiago", "Sao Paulo", "Johannesburg", "Le Cap", "Marrakech", "Istanbul", "Athènes", "Jérusalem",
    "La Mecque", "Vatican", "Monaco", "Genève", "Zurich", "Bruxelles", "Amsterdam", "Copenhague", "Stockholm", "Oslo",
    "Helsinki", "Reykjavik", "Dublin", "Édimbourg", "Vienne", "Prague", "Budapest", "Varsovie", "Kiev", "Saint-Pétersbourg",
    "Séoul", "Hong Kong", "Taipei", "Manille", "Jakarta", "Kuala Lumpur", "Hanoï", "Hô Chi Minh", "Phnom Penh", "Vientiane",
    "Yangon", "Katmandou", "New Delhi", "Islamabad", "Téhéran", "Bagdad", "Damas", "Beyrouth", "Amman", "Riyad",
    "Koweït", "Doha", "Mascate", "Sanaa", "Aden", "Kaboul", "Tachkent", "Almaty", "Bichkek", "Douchanbé"
  ],
  [PASSWORD_CATEGORIES.CHARACTERS]: [
    "Harry Potter", "Ron Weasley", "Hermione Granger", "Dumbledore", "Voldemort", "Rogue", "Hagrid", "Drago Malefoy", "Sirius Black", "Dobby",
    "Frodon", "Sam", "Gandalf", "Aragorn", "Legolas", "Gimli", "Boromir", "Sauron", "Gollum", "Bilbon",
    "Luke Skywalker", "Leia Organa", "Han Solo", "Chewbacca", "Dark Vador", "Yoda", "Obi-Wan Kenobi", "R2-D2", "C-3PO", "Palpatine",
    "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Spiderman", "Doctor Strange", "Black Panther", "Ant-Man",
    "Batman", "Superman", "Wonder Woman", "Flash", "Aquaman", "Cyborg", "Joker", "Harley Quinn", "Lex Luthor", "Le Pingouin",
    "Mickey", "Minnie", "Donald", "Daisy", "Dingo", "Pluto", "Picsou", "Riri", "Fifi", "Loulou",
    "Tintin", "Milou", "Haddock", "Tournesol", "Dupond", "Dupont", "Castafiore", "Rastapopoulos", "Nestor", "Séraphin Lampion",
    "Astérix", "Obélix", "Panoramix", "Abraracourcix", "Assurancetourix", "Falbala", "Idéfix", "César", "Cléopâtre", "Numérobis"
  ],
  [PASSWORD_CATEGORIES.POP_CULTURE]: [
    "Netflix", "Youtube", "Spotify", "Instagram", "Tiktok", "Snapchat", "Facebook", "Twitter", "Linkedin", "Pinterest",
    "Fortnite", "Minecraft", "League of Legends", "Among Us", "Call of Duty", "FIFA", "GTA", "Mario Kart", "Zelda", "Pokemon",
    "Game of Thrones", "Breaking Bad", "Stranger Things", "La Casa de Papel", "Squid Game", "The Witcher", "Friends", "How I Met Your Mother", "The Big Bang Theory", "The Office",
    "Star Wars", "Harry Potter", "Seigneur des Anneaux", "Marvel", "DC Comics", "Disney", "Pixar", "Dreamworks", "Ghibli", "Anime",
    "Beyoncé", "Rihanna", "Drake", "Eminem", "Kanye West", "Taylor Swift", "Justin Bieber", "Ariana Grande", "Ed Sheeran", "Adele",
    "Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Johnny Depp", "Will Smith", "Angelina Jolie", "Jennifer Lawrence", "Scarlett Johansson", "Emma Watson", "Meryl Streep",
    "Oscar", "Grammy", "Emmy", "Tony", "Palme d'Or", "César", "Golden Globe", "BAFTA", "MTV", "NRJ Music Awards",
    "Eurovision", "Super Bowl", "Coupe du Monde", "Jeux Olympiques", "Tour de France", "Roland Garros", "Wimbledon", "NBA", "NFL", "F1"
  ],
  [PASSWORD_CATEGORIES.ADULT]: [
    "Kama Sutra", "Position 69", "Levrette", "Missionnaire", "Sodomie", "Fellation", "Cunnilingus", "Anulingus", "Masturbation",
    "Orgasme", "Éjaculation", "Sperme", "Gode", "Vibromasseur", "Plug anal", "Menottes", "Fouet", "Cagoule",
    "Lingerie", "String", "Porte-jarretelles", "Bas résille", "Soutien-gorge", "Culotte", "Nudiste", "Naturisme", "Plage nue", "Effeuillage",
    "Danse privée", "Danse à la barre", "Club libertin", "Échangisme", "Partouze", "Triolisme", "Voyeurisme", "Exhibitionnisme", "Fétichisme", "Masochisme",
    "Sadisme", "Dominatrice", "Soumis", "Escorte", "Gigolo", "Prostituée", "Maison close", "Quartier Rouge", "Pornographie",
    "Acteur X", "Jacquie et Michel", "OnlyFans", "Site pour adultes", "Péché mignon", "Fantasme", "Désir", "Libido", "Excitation", "Préliminaires",
    "Pénis", "Vagin", "Vulve", "Clitoris", "Testicules", "Seins", "Tétons", "Fesses", "Poils", "Pubis", "Verge", "Minou", "Zizi",
    "Cannabis", "Marijuana", "Joint", "Pétard", "Bang", "LSD", "Champignon magique", "Hallucination", "Aphrodisiaque",
    "Préservatif", "Capote", "Pilule", "Stérilet", "Test de grossesse", "Gynécologue", "Urologue",
    "Lit", "Draps", "Hôtel", "Motel", "Banquette arrière", "Ascenseur", "Jacuzzi", "Douche", "Sauna", "Hammam",
    "Massage", "Huile", "Bougie", "Romance", "Baiser", "Pelle", "Langue", "Suçon", "Morsure", "Griffure",
    "Infidélité", "Maîtresse", "Amant", "Aventure", "Coup d'un soir", "Plan cul", "Sexfriend", "Drague", "Séduction",
    "Cuir", "Latex", "Dentelle", "Soie", "Velours", "Nuisette", "Kimono", "Talon aiguille", "Rouge à lèvres"
  ]
};