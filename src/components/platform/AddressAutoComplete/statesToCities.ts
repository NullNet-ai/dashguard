const statesToCities = [
  {
    "country": "Afghanistan",
    "states": [
      {
        "name": "Badakhshan",
        "cities": ["Fayzabad", "Eshkashem", "Jurm", "Khash", "Baharak"]
      },
      {
        "name": "Badghis",
        "cities": ["Qala-e-Naw", "Bala Murghab", "Ab Kamari", "Jawand", "Muqur"]
      },
      {
        "name": "Baghlan",
        "cities": ["Puli Khumri", "Baghlan", "Dahana-i-Ghuri", "Dushi", "Khinjan"]
      },
      {
        "name": "Balkh",
        "cities": ["Mazar-i-Sharif", "Balkh", "Shulgara", "Chimtal", "Dawlatabad"]
      },
      {
        "name": "Bamyan",
        "cities": ["Bamyan", "Yakawlang", "Panjab", "Shibar", "Kahmard"]
      },
      {
        "name": "Daykundi",
        "cities": ["Nili", "Khedir", "Ishtarlay", "Kiti", "Miramor"]
      },
      {
        "name": "Farah",
        "cities": ["Farah", "Anar Dara", "Bakwa", "Pusht Rod", "Shindand"]
      },
      {
        "name": "Faryab",
        "cities": ["Maimana", "Andkhoy", "Dawlatabad", "Khwaja Sabz Posh", "Qaysar"]
      },
      {
        "name": "Ghazni",
        "cities": ["Ghazni", "Andar", "Deh Yak", "Gelan", "Qarabagh"]
      },
      {
        "name": "Ghor",
        "cities": ["Chaghcharan", "Dawlat Yar", "Lal Wa Sarjangal", "Pasaband", "Taywara"]
      },
      {
        "name": "Helmand",
        "cities": ["Lashkargah", "Gereshk", "Sangin", "Nad Ali", "Nawa-I-Barakzayi"]
      },
      {
        "name": "Herat",
        "cities": ["Herat", "Ghoryan", "Guzara", "Injil", "Karukh"]
      },
      {
        "name": "Jowzjan",
        "cities": ["Sheberghan", "Aqcha", "Darzab", "Fayzabad", "Khwaja Du Koh"]
      },
      {
        "name": "Kabul",
        "cities": ["Kabul", "Bagrami", "Deh Sabz", "Mir Bacha Kot", "Paghman"]
      },
      {
        "name": "Kandahar",
        "cities": ["Kandahar", "Arghandab", "Daman", "Ghorak", "Maiwand"]
      },
      {
        "name": "Kapisa",
        "cities": ["Mahmud-i-Raqi", "Hesa-i-Awal Kohistan", "Koh Band", "Tagab", "Alasay"]
      },
      {
        "name": "Khost",
        "cities": ["Khost", "Bak", "Gurbuz", "Jaji Maydan", "Mandozayi"]
      },
      {
        "name": "Kunar",
        "cities": ["Asadabad", "Bar Kunar", "Chapa Dara", "Dangam", "Ghaziabad"]
      },
      {
        "name": "Kunduz",
        "cities": ["Kunduz", "Aliabad", "Archi", "Chardara", "Imam Sahib"]
      },
      {
        "name": "Laghman",
        "cities": ["Mihtarlam", "Alingar", "Dawlat Shah", "Qarghayi", "Alishing"]
      },
      {
        "name": "Logar",
        "cities": ["Pul-i-Alam", "Baraki Barak", "Charkh", "Kharwar", "Mohammad Agha"]
      },
      {
        "name": "Nangarhar",
        "cities": ["Jalalabad", "Achin", "Bati Kot", "Behsud", "Chaprihar"]
      },
      {
        "name": "Nimruz",
        "cities": ["Zaranj", "Chakhansur", "Kang", "Khash Rod", "Delaram"]
      },
      {
        "name": "Nuristan",
        "cities": ["Parun", "Barg-i-Matal", "Du Ab", "Kamdesh", "Wama"]
      },
      {
        "name": "Paktia",
        "cities": ["Gardez", "Ahmadabad", "Dand Wa Patan", "Jaji", "Zurmat"]
      },
      {
        "name": "Paktika",
        "cities": ["Sharana", "Barmal", "Dila", "Gayan", "Gomal"]
      },
      {
        "name": "Panjshir",
        "cities": ["Bazarak", "Anaba", "Darah", "Khenj", "Rokha"]
      },
      {
        "name": "Parwan",
        "cities": ["Charikar", "Bagram", "Jabal Saraj", "Shinwari", "Surkhi Parsa"]
      },
      {
        "name": "Samangan",
        "cities": ["Aybak", "Dara-i-Suf", "Hazrati Sultan", "Khuram Wa Sarbagh", "Ruyi Du Ab"]
      },
      {
        "name": "Sar-e Pol",
        "cities": ["Sar-e Pol", "Balkhab", "Gosfandi", "Kohistanat", "Sangcharak"]
      },
      {
        "name": "Takhar",
        "cities": ["Taloqan", "Baharak", "Banghi", "Chah Ab", "Farkhar"]
      },
      {
        "name": "Urozgan",
        "cities": ["Tarinkot", "Chora", "Deh Rawud", "Gizab", "Khas Urozgan"]
      },
      {
        "name": "Wardak",
        "cities": ["Maidan Shar", "Chaki Wardak", "Day Mirdad", "Hisa-i-Awali Bihsud", "Jalrez"]
      },
      {
        "name": "Zabul",
        "cities": ["Qalat", "Argahandab", "Atghar", "Dey Chopan", "Shahjoy"]
      }
    ]
  },
  {
    "country": "Albania",
    "states": [
      {
        "name": "Berat",
        "cities": ["Berat", "Poliçan", "Kuçovë", "Ura Vajgurore", "Çorovodë"]
      },
      {
        "name": "Dibër",
        "cities": ["Peshkopi", "Bulqizë", "Burrel", "Klos", "Maqellarë"]
      },
      {
        "name": "Durrës",
        "cities": ["Durrës", "Shijak", "Sukth", "Manëz", "Ishëm"]
      },
      {
        "name": "Elbasan",
        "cities": ["Elbasan", "Peqin", "Gramsh", "Librazhd", "Belsh"]
      },
      {
        "name": "Fier",
        "cities": ["Fier", "Patos", "Roskovec", "Ballsh", "Divjakë"]
      },
      {
        "name": "Gjirokastër",
        "cities": ["Gjirokastër", "Përmet", "Tepelenë", "Libohovë", "Memaliaj"]
      },
      {
        "name": "Korçë",
        "cities": ["Korçë", "Pogradec", "Ersekë", "Maliq", "Leskovik"]
      },
      {
        "name": "Kukës",
        "cities": ["Kukës", "Has", "Tropojë", "Bajram Curri", "Fushë-Arrëz"]
      },
      {
        "name": "Lezhë",
        "cities": ["Lezhë", "Laç", "Mamurras", "Rrëshen", "Rubik"]
      },
      {
        "name": "Shkodër",
        "cities": ["Shkodër", "Koplik", "Vau i Dejës", "Pukë", "Fushë-Arrëz"]
      },
      {
        "name": "Tirana",
        "cities": ["Tirana", "Kamëz", "Kavajë", "Vorë", "Rrogozhinë"]
      },
      {
        "name": "Vlorë",
        "cities": ["Vlorë", "Sarandë", "Himarë", "Orikum", "Selenicë"]
      }
    ]
  },
  {
    "country": "Algeria",
    "states": [
      {
        "name": "Adrar",
        "cities": ["Adrar", "Reggane", "Aoulef", "Zaouiet Kounta", "Timioun"]
      },
      {
        "name": "Chlef",
        "cities": ["Chlef", "Ténès", "Beni Haoua", "Ouled Fares", "Zeboudja"]
      },
      {
        "name": "Laghouat",
        "cities": ["Laghouat", "Ksar El Hirane", "Aflou", "Gueltat Sidi Saad", "Hassi R'Mel"]
      },
      {
        "name": "Oum El Bouaghi",
        "cities": ["Oum El Bouaghi", "Aïn Beïda", "Aïn Babouche", "Aïn M'lila", "Ksar Sbahi"]
      },
      {
        "name": "Batna",
        "cities": ["Batna", "Merouana", "Barika", "Tazoult", "Arris"]
      },
      {
        "name": "Béjaïa",
        "cities": ["Béjaïa", "Amizour", "Akbou", "Sidi Aïch", "El Kseur"]
      },
      {
        "name": "Biskra",
        "cities": ["Biskra", "Sidi Okba", "Oumache", "Zeribet El Oued", "Tolga"]
      },
      {
        "name": "Béchar",
        "cities": ["Béchar", "Kenadsa", "Abadla", "Taghit", "Beni Ounif"]
      },
      {
        "name": "Blida",
        "cities": ["Blida", "Boufarik", "Bouinan", "Oued El Alleug", "Larbaa"]
      },
      {
        "name": "Bouira",
        "cities": ["Bouira", "Souk El Khemis", "Aïn Bessem", "Bordj Okhriss", "El Asnam"]
      },
      {
        "name": "Tamanrasset",
        "cities": ["Tamanrasset", "Abalessa", "In Salah", "In Ghar", "Tazrouk"]
      },
      {
        "name": "Tébessa",
        "cities": ["Tébessa", "Bir El Ater", "Cheria", "Morsott", "El Kouif"]
      },
      {
        "name": "Tlemcen",
        "cities": ["Tlemcen", "Hennaya", "Remchi", "Sebdou", "Bensekrane"]
      },
      {
        "name": "Tiaret",
        "cities": ["Tiaret", "Mahdia", "Sougueur", "Aïn Deheb", "Frenda"]
      },
      {
        "name": "Tizi Ouzou",
        "cities": ["Tizi Ouzou", "Azazga", "Draâ Ben Khedda", "Mekla", "Boghni"]
      },
      {
        "name": "Algiers",
        "cities": ["Algiers", "Bouzaréah", "Bab Ezzouar", "Hussein Dey", "Dar El Beïda"]
      },
      {
        "name": "Djelfa",
        "cities": ["Djelfa", "Aïn Oussera", "Birine", "Hassi Bahbah", "Messad"]
      },
      {
        "name": "Jijel",
        "cities": ["Jijel", "Taher", "El Ancer", "Sidi Maarouf", "Chekfa"]
      },
      {
        "name": "Sétif",
        "cities": ["Sétif", "El Eulma", "Aïn Oulmene", "Bougaâ", "Hammam Guergour"]
      },
      {
        "name": "Saïda",
        "cities": ["Saïda", "El Hassasna", "Youb", "Sidi Boubekeur", "Aïn El Hadjar"]
      },
      {
        "name": "Skikda",
        "cities": ["Skikda", "Azzaba", "El Harrouch", "Tamalous", "Ben Azzouz"]
      },
      {
        "name": "Sidi Bel Abbès",
        "cities": ["Sidi Bel Abbès", "Télagh", "Ténira", "Ras El Ma", "Mostefa Ben Brahim"]
      },
      {
        "name": "Annaba",
        "cities": ["Annaba", "El Bouni", "Sidi Amar", "El Hadjar", "Chetaïbi"]
      },
      {
        "name": "Guelma",
        "cities": ["Guelma", "Hammam Debagh", "Aïn Makhlouf", "Bouati Mahmoud", "Oued Zenati"]
      },
      {
        "name": "Constantine",
        "cities": ["Constantine", "El Khroub", "Aïn Abid", "Zighoud Youcef", "Hamma Bouziane"]
      },
      {
        "name": "Médéa",
        "cities": ["Médéa", "Berrouaghia", "Ksar El Boukhari", "Aïn Boucif", "Chelalet El Adhaoura"]
      },
      {
        "name": "Mostaganem",
        "cities": ["Mostaganem", "Aïn Tedeles", "Sidi Ali", "Mesra", "Bouguirat"]
      },
      {
        "name": "M'Sila",
        "cities": ["M'Sila", "Bou Saâda", "Aïn El Melh", "Ouled Derradj", "Sidi Aïssa"]
      },
      {
        "name": "Mascara",
        "cities": ["Mascara", "Mohammedia", "Sig", "Bou Hanifia", "Tighennif"]
      },
      {
        "name": "Ouargla",
        "cities": ["Ouargla", "Hassi Messaoud", "N'Goussa", "Rouissat", "Sidi Khouiled"]
      },
      {
        "name": "Oran",
        "cities": ["Oran", "Bir El Djir", "Es Senia", "Arzew", "Aïn El Turk"]
      },
      {
        "name": "El Bayadh",
        "cities": ["El Bayadh", "Rogassa", "Brezina", "Chellala", "Bougtoub"]
      },
      {
        "name": "Illizi",
        "cities": ["Illizi", "Djanet", "Bordj Omar Driss", "In Amenas", "Debdeb"]
      },
      {
        "name": "Bordj Bou Arréridj",
        "cities": ["Bordj Bou Arréridj", "Ras El Oued", "Mansourah", "El Hamadia", "Bir Kasdali"]
      },
      {
        "name": "Boumerdès",
        "cities": ["Boumerdès", "Boudouaou", "Dellys", "Thénia", "Corso"]
      },
      {
        "name": "El Tarf",
        "cities": ["El Tarf", "Bouhadjar", "Ben M'Hidi", "Besbes", "Dréan"]
      },
      {
        "name": "Tindouf",
        "cities": ["Tindouf", "Oum El Assel", "Zaouiet Kounta"]
      },
      {
        "name": "Tissemsilt",
        "cities": ["Tissemsilt", "Theniet El Had", "Lazharia", "Bordj Bounaama", "Khemisti"]
      },
      {
        "name": "El Oued",
        "cities": ["El Oued", "Debila", "Djamaa", "Robbah", "Taleb Larbi"]
      },
      {
        "name": "Khenchela",
        "cities": ["Khenchela", "Babar", "Chechar", "Tamza", "Ouled Rechache"]
      },
      {
        "name": "Souk Ahras",
        "cities": ["Souk Ahras", "Sedrata", "M'Daourouch", "Ouled Driss", "Taoura"]
      },
      {
        "name": "Tipaza",
        "cities": ["Tipaza", "Cherchell", "Hadjout", "Fouka", "Sidi Amar"]
      },
      {
        "name": "Mila",
        "cities": ["Mila", "Ferdjioua", "Grarem Gouga", "Telerghma", "Chelghoum Laïd"]
      },
      {
        "name": "Aïn Defla",
        "cities": ["Aïn Defla", "Miliana", "Khemis Miliana", "Bordj Emir Khaled", "El Attaf"]
      },
      {
        "name": "Naâma",
        "cities": ["Naâma", "Mécheria", "Aïn Sefra", "Tiout", "Mekmen Ben Amar"]
      },
      {
        "name": "Aïn Témouchent",
        "cities": ["Aïn Témouchent", "Beni Saf", "Hammam Bou Hadjar", "El Malah", "Oulhassa Gheraba"]
      },
      {
        "name": "Ghardaïa",
        "cities": ["Ghardaïa", "El Atteuf", "Metlili", "Bounoura", "Berriane"]
      },
      {
        "name": "Relizane",
        "cities": ["Relizane", "Oued Rhiou", "Zemmoura", "Djidiouia", "Mendes"]
      },
      {
        "name": "Timimoun",
        "cities": ["Timimoun", "Aougrout", "Charouine", "Ouled Said", "Talmine"]
      },
      {
        "name": "Bordj Badji Mokhtar",
        "cities": ["Bordj Badji Mokhtar", "Timiaouine"]
      },
      {
        "name": "Ouled Djellal",
        "cities": ["Ouled Djellal", "Doucen", "Sidi Khaled", "Ras El Miaad"]
      },
      {
        "name": "Béni Abbès",
        "cities": ["Béni Abbès", "Igli", "Kerzaz", "Ouled Khoudir"]
      },
      {
        "name": "In Salah",
        "cities": ["In Salah", "Foggaret Ezzaouia"]
      },
      {
        "name": "In Guezzam",
        "cities": ["In Guezzam", "Tin Zaouatine"]
      },
      {
        "name": "Touggourt",
        "cities": ["Touggourt", "Mégarine", "Zaouia El Abidia", "Nezla", "Taibet"]
      },
      {
        "name": "Djanet",
        "cities": ["Djanet", "Bordj El Haouas"]
      },
      {
        "name": "El M'Ghair",
        "cities": ["El M'Ghair", "Djamaa", "Still"]
      },
      {
        "name": "El Menia",
        "cities": ["El Menia", "Hassi Gara", "Mansoura"]
      }
    ]
  },
  {
    "country": "Andorra",
    "states": [
      {
        "name": "Andorra la Vella",
        "cities": ["Andorra la Vella", "La Margineda", "Santa Coloma"]
      },
      {
        "name": "Canillo",
        "cities": ["Canillo", "Soldeu", "El Tarter", "Ransol", "Meritxell"]
      },
      {
        "name": "Encamp",
        "cities": ["Encamp", "Les Bons", "Vila", "El Pas de la Casa", "Grau Roig"]
      },
      {
        "name": "Escaldes-Engordany",
        "cities": ["Escaldes-Engordany", "Vila", "Engordany", "El Fener"]
      },
      {
        "name": "La Massana",
        "cities": ["La Massana", "Arinsal", "Pal", "Erts", "Sispony"]
      },
      {
        "name": "Ordino",
        "cities": ["Ordino", "El Serrat", "La Cortinada", "Ansalonga", "Llorts"]
      },
      {
        "name": "Sant Julià de Lòria",
        "cities": ["Sant Julià de Lòria", "Bixessarri", "Aixovall", "Fontaneda", "Nagol"]
      }
    ]
  },
  {
    "country": "Angola",
    "states": [
      {
        "name": "Bengo",
        "cities": ["Caxito", "Barra do Dande", "Nambuangongo", "Pango Aluquém", "Dande"]
      },
      {
        "name": "Benguela",
        "cities": ["Benguela", "Lobito", "Baía Farta", "Catumbela", "Ganda"]
      },
      {
        "name": "Bié",
        "cities": ["Kuito", "Andulo", "Camacupa", "Catabola", "Chinguar"]
      },
      {
        "name": "Cabinda",
        "cities": ["Cabinda", "Belize", "Buco-Zau", "Landana", "Cacongo"]
      },
      {
        "name": "Cuando Cubango",
        "cities": ["Menongue", "Cuito Cuanavale", "Rivungo", "Dirico", "Mavinga"]
      },
      {
        "name": "Cuanza Norte",
        "cities": ["N'dalatando", "Golungo Alto", "Lucala", "Quiculungo", "Cazengo"]
      },
      {
        "name": "Cuanza Sul",
        "cities": ["Sumbe", "Porto Amboim", "Gabela", "Quilenda", "Cassongue"]
      },
      {
        "name": "Cunene",
        "cities": ["Ondjiva", "Cahama", "Curoca", "Namacunde", "Xangongo"]
      },
      {
        "name": "Huambo",
        "cities": ["Huambo", "Caála", "Bailundo", "Longonjo", "Ucuma"]
      },
      {
        "name": "Huíla",
        "cities": ["Lubango", "Matala", "Quipungo", "Caconda", "Chibia"]
      },
      {
        "name": "Luanda",
        "cities": ["Luanda", "Cacuaco", "Viana", "Belas", "Cazenga"]
      },
      {
        "name": "Lunda Norte",
        "cities": ["Dundo", "Lucapa", "Cambulo", "Capenda Camulemba", "Xá-Muteba"]
      },
      {
        "name": "Lunda Sul",
        "cities": ["Saurimo", "Cacolo", "Dala", "Muconda", "Cazage"]
      },
      {
        "name": "Malanje",
        "cities": ["Malanje", "Cacuso", "Calandula", "Cangandala", "Luquembo"]
      },
      {
        "name": "Moxico",
        "cities": ["Luena", "Lumeje", "Camanongue", "Léua", "Luchazes"]
      },
      {
        "name": "Namibe",
        "cities": ["Moçâmedes", "Tômbua", "Virei", "Bibala", "Camucuio"]
      },
      {
        "name": "Uíge",
        "cities": ["Uíge", "Mbanza Kongo", "Negage", "Damba", "Alto Cauale"]
      },
      {
        "name": "Zaire",
        "cities": ["M'banza-Kongo", "Soyo", "N'zeto", "Tomboco", "Cuimba"]
      }
    ]
  },
  //!!!TO BE REVISIT
  {
    "country": "Antarctica",
    "states": [
      {
        "name": "Argentina",
        "cities": ["Esperanza Base", "Marambio Base", "Carlini Base", "Orcadas Base", "Belgrano II"]
      },
      {
        "name": "Australia",
        "cities": ["Casey Station", "Davis Station", "Mawson Station", "Macquarie Island Station"]
      },
      {
        "name": "Brazil",
        "cities": ["Comandante Ferraz Antarctic Station"]
      },
      {
        "name": "Chile",
        "cities": ["Villa Las Estrellas", "Presidente Eduardo Frei Montalva Base", "Captain Arturo Prat Base"]
      },
      {
        "name": "China",
        "cities": ["Great Wall Station", "Zhongshan Station", "Kunlun Station", "Taishan Station"]
      },
      {
        "name": "France",
        "cities": ["Dumont d'Urville Station", "Concordia Station (with Italy)"]
      },
      {
        "name": "Germany",
        "cities": ["Neumayer Station III"]
      },
      {
        "name": "India",
        "cities": ["Bharati Station", "Maitri Station"]
      },
      {
        "name": "Italy",
        "cities": ["Mario Zucchelli Station", "Concordia Station (with France)"]
      },
      {
        "name": "Japan",
        "cities": ["Showa Station", "Dome Fuji Station"]
      },
      {
        "name": "New Zealand",
        "cities": ["Scott Base"]
      },
      {
        "name": "Norway",
        "cities": ["Troll Station"]
      },
      {
        "name": "Russia",
        "cities": ["Vostok Station", "Mirny Station", "Bellingshausen Station", "Novolazarevskaya Station"]
      },
      {
        "name": "South Africa",
        "cities": ["SANAE IV"]
      },
      {
        "name": "South Korea",
        "cities": ["King Sejong Station", "Jang Bogo Station"]
      },
      {
        "name": "United Kingdom",
        "cities": ["Halley Research Station", "Rothera Research Station"]
      },
      {
        "name": "United States",
        "cities": ["McMurdo Station", "Amundsen-Scott South Pole Station", "Palmer Station"]
      }
    ]
  },
  {
    "country": "Antigua and Barbuda",
    "states": [
      {
        "name": "Saint George",
        "cities": ["Piggotts", "Parham", "Fitches Creek"]
      },
      {
        "name": "Saint John",
        "cities": ["St. John's (capital)", "Buckleys", "Cook's Hill"]
      },
      {
        "name": "Saint Mary",
        "cities": ["Bolans", "Old Road", "Sea View Farm"]
      },
      {
        "name": "Saint Paul",
        "cities": ["Falmouth", "Liberta", "English Harbour"]
      },
      {
        "name": "Saint Peter",
        "cities": ["Parham", "Freetown", "Newfield"]
      },
      {
        "name": "Saint Philip",
        "cities": ["Willikies", "Freetown", "Long Bay"]
      },
      {
        "name": "Barbuda",
        "cities": ["Codrington", "Coco Point", "Palmetto Point"]
      },
      {
        "name": "Redonda",
        "cities": ["Uninhabited"]
      }
    ]
  },
  {
    "country": "Argentina",
    "states": [
      {
        "name": "Autonomous City of Buenos Aires",
        "cities": ["Buenos Aires"]
      },
      {
        "name": "Buenos Aires Province",
        "cities": ["La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Tandil"]
      },
      {
        "name": "Catamarca",
        "cities": ["San Fernando del Valle de Catamarca", "Santa María", "Andalgalá", "Belén", "Fiambalá"]
      },
      {
        "name": "Chaco",
        "cities": ["Resistencia", "Barranqueras", "Presidencia Roque Sáenz Peña", "Charata", "Villa Ángela"]
      },
      {
        "name": "Chubut",
        "cities": ["Rawson", "Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Esquel"]
      },
      {
        "name": "Córdoba",
        "cities": ["Córdoba", "Río Cuarto", "Villa María", "San Francisco", "Alta Gracia"]
      },
      {
        "name": "Corrientes",
        "cities": ["Corrientes", "Goya", "Mercedes", "Curuzú Cuatiá", "Paso de los Libres"]
      },
      {
        "name": "Entre Ríos",
        "cities": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Victoria"]
      },
      {
        "name": "Formosa",
        "cities": ["Formosa", "Clorinda", "Pirané", "El Colorado", "Las Lomitas"]
      },
      {
        "name": "Jujuy",
        "cities": ["San Salvador de Jujuy", "Palpalá", "Libertador General San Martín", "Humahuaca", "La Quiaca"]
      },
      {
        "name": "La Pampa",
        "cities": ["Santa Rosa", "General Pico", "Toay", "Realicó", "Eduardo Castex"]
      },
      {
        "name": "La Rioja",
        "cities": ["La Rioja", "Chilecito", "Aimogasta", "Chamical", "Chepes"]
      },
      {
        "name": "Mendoza",
        "cities": ["Mendoza", "San Rafael", "Godoy Cruz", "Las Heras", "Luján de Cuyo"]
      },
      {
        "name": "Misiones",
        "cities": ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "San Vicente"]
      },
      {
        "name": "Neuquén",
        "cities": ["Neuquén", "Cutral Có", "Plottier", "Zapala", "San Martín de los Andes"]
      },
      {
        "name": "Río Negro",
        "cities": ["Viedma", "Bariloche", "Cipolletti", "General Roca", "San Carlos de Bariloche"]
      },
      {
        "name": "Salta",
        "cities": ["Salta", "San Ramón de la Nueva Orán", "Tartagal", "Cafayate", "Metán"]
      },
      {
        "name": "San Juan",
        "cities": ["San Juan", "Rivadavia", "Pocito", "Caucete", "Chimbas"]
      },
      {
        "name": "San Luis",
        "cities": ["San Luis", "Villa Mercedes", "Merlo", "La Toma", "Concarán"]
      },
      {
        "name": "Santa Cruz",
        "cities": ["Río Gallegos", "Caleta Olivia", "El Calafate", "Pico Truncado", "Puerto Deseado"]
      },
      {
        "name": "Santa Fe",
        "cities": ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista"]
      },
      {
        "name": "Santiago del Estero",
        "cities": ["Santiago del Estero", "La Banda", "Frías", "Añatuya", "Termas de Río Hondo"]
      },
      {
        "name": "Tierra del Fuego",
        "cities": ["Ushuaia", "Río Grande", "Tolhuin"]
      },
      {
        "name": "Tucumán",
        "cities": ["San Miguel de Tucumán", "Yerba Buena", "Concepción", "Aguilares", "Famaillá"]
      }
    ]
  },
  {
    "country": "Armenia",
    "states": [
      {
        "name": "Aragatsotn",
        "cities": ["Ashtarak (capital)", "Aparan", "Talin", "Aragats", "Alagyaz", "Tsaghkahovit", "Kosh", "Byurakan", "Tegher"]
      },
      {
        "name": "Ararat",
        "cities": ["Artashat (capital)", "Ararat", "Masis", "Vedi", "Yeraskh", "Aygavan", "Arevshat", "Dvin", "Shahumyan", "Surenavan"]
      },
      {
        "name": "Armavir",
        "cities": ["Armavir (capital)", "Vagharshapat", "Metsamor", "Sardarapat", "Baghramyan", "Myasnikyan", "Nalbandyan", "Markara", "Parakar"]
      },
      {
        "name": "Gegharkunik",
        "cities": ["Gavar (capital)", "Sevan", "Martuni", "Vardenis", "Chambarak", "Shorzhа", "Yeranos", "Tsakkar", "Lichk", "Sarukhan"]
      },
      {
        "name": "Kotayk",
        "cities": ["Hrazdan (capital)", "Abovyan", "Byureghavan", "Charentsavan", "Tsaghkadzor", "Yeghvard", "Nor Hachn", "Arzni", "Garni", "Fantan"]
      },
      {
        "name": "Lori",
        "cities": ["Vanadzor (capital)", "Alaverdi", "Spitak", "Stepanavan", "Tashir", "Akhtala", "Tumanyan", "Shamlugh", "Dendrit", "Odzun"]
      },
      {
        "name": "Shirak",
        "cities": ["Gyumri (capital)", "Artik", "Maralik", "Ani", "Ashotsq", "Akhuryan", "Amasia", "Arapi", "Azatan", "Karmrakar"]
      },
      {
        "name": "Syunik",
        "cities": ["Kapan (capital)", "Goris", "Sisian", "Kajaran", "Meghri", "Agarak", "Dastakert", "Lor", "Shenatagh", "Qajarants"]
      },
      {
        "name": "Tavush",
        "cities": ["Ijevan (capital)", "Dilijan", "Berd", "Noyemberyan", "Ayrum", "Koghb", "Archis", "Voskepar", "Baghanis", "Haghartsin"]
      },
      {
        "name": "Vayots Dzor",
        "cities": ["Yeghegnadzor (capital)", "Vayk", "Jermuk", "Areni", "Malishka", "Aghavnadzor", "Getap", "Rind", "Gladzor", "Yelpin"]
      },
      {
        "name": "Yerevan",
        "cities": ["Yerevan (capital)", "Ajapnyak", "Arabkir", "Avan", "Davtashen", "Erebuni", "Kanaker-Zeytun", "Kentron", "Malatia-Sebastia", "Nork-Marash", "Nor Nork", "Nubarashen", "Shengavit"]
      }
    ]
  },
  {
    "country": "Australia",
    "states": [
      {
        "name": "New South Wales",
        "cities": ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Maitland"]
      },
      {
        "name": "Victoria",
        "cities": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Mildura"]
      },
      {
        "name": "Queensland",
        "cities": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"]
      },
      {
        "name": "Western Australia",
        "cities": ["Perth", "Mandurah", "Bunbury", "Geraldton", "Kalgoorlie"]
      },
      {
        "name": "South Australia",
        "cities": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Pirie"]
      },
      {
        "name": "Tasmania",
        "cities": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone"]
      },
      {
        "name": "Australian Capital Territory",
        "cities": ["Canberra"]
      },
      {
        "name": "Northern Territory",
        "cities": ["Darwin", "Alice Springs", "Palmerston", "Katherine", "Nhulunbuy"]
      }
    ]
  },
  {
    "country": "Austria",
    "states": [
      {
        "name": "Burgenland",
        "cities": ["Eisenstadt", "Rust", "Neusiedl am See", "Mattersburg", "Oberwart"]
      },
      {
        "name": "Carinthia (Kärnten)",
        "cities": ["Klagenfurt", "Villach", "Wolfsberg", "Spittal an der Drau", "Feldkirchen"]
      },
      {
        "name": "Lower Austria (Niederösterreich)",
        "cities": ["St. Pölten", "Wiener Neustadt", "Krems an der Donau", "Baden", "Amstetten"]
      },
      {
        "name": "Upper Austria (Oberösterreich)",
        "cities": ["Linz", "Wels", "Steyr", "Leonding", "Traun"]
      },
      {
        "name": "Salzburg",
        "cities": ["Salzburg", "Hallein", "Saalfelden", "Zell am See", "Bischofshofen"]
      },
      {
        "name": "Styria (Steiermark)",
        "cities": ["Graz", "Leoben", "Kapfenberg", "Bruck an der Mur", "Feldbach"]
      },
      {
        "name": "Tyrol (Tirol)",
        "cities": ["Innsbruck", "Kufstein", "Telfs", "Schwaz", "Hall in Tirol"]
      },
      {
        "name": "Vorarlberg",
        "cities": ["Bregenz", "Dornbirn", "Feldkirch", "Hohenems", "Bludenz"]
      },
      {
        "name": "Vienna (Wien)",
        "cities": ["Vienna"]
      }
    ]
  },
  // //!!!TOBE REVISIT
  // "Azerbaijan": {},
  {
    "country": "Bahamas",
    "states": [
      {
        "name": "Acklins",
        "cities": ["Spring Point", "Snug Corner", "Lovely Bay"]
      },
      {
        "name": "Acklins and Crooked Islands",
        "cities": ["Spring Point", "Colonel Hill", "Landrail Point"]
      },
      {
        "name": "Berry Islands",
        "cities": ["Great Harbour Cay", "Chub Cay", "Bullocks Harbour"]
      },
      {
        "name": "Bimini",
        "cities": ["Alice Town", "Bailey Town", "South Bimini"]
      },
      {
        "name": "Black Point",
        "cities": ["Black Point", "Staniel Cay"]
      },
      {
        "name": "Cat Island",
        "cities": ["Arthur's Town", "New Bight", "Orange Creek"]
      },
      {
        "name": "Central Abaco",
        "cities": ["Marsh Harbour", "Dundas Town", "Murphy Town"]
      },
      {
        "name": "Central Andros",
        "cities": ["Fresh Creek", "Cargill Creek", "Staniard Creek"]
      },
      {
        "name": "Central Eleuthera",
        "cities": ["Governor's Harbour", "James Cistern", "Gregory Town"]
      },
      {
        "name": "City of Freeport",
        "cities": ["Freeport", "Lucaya", "Pinder's Point"]
      },
      {
        "name": "Crooked Island",
        "cities": ["Colonel Hill", "Landrail Point", "Pittstown Point"]
      },
      {
        "name": "East Grand Bahama",
        "cities": ["McLean's Town", "Pelican Point", "Sweeting's Cay"]
      },
      {
        "name": "Exuma",
        "cities": ["George Town", "Rolleville", "Mount Thompson"]
      },
      {
        "name": "Grand Cay",
        "cities": ["Grand Cay"]
      },
      {
        "name": "Harbour Island",
        "cities": ["Dunmore Town"]
      },
      {
        "name": "Hope Town",
        "cities": ["Hope Town", "White Sound"]
      },
      {
        "name": "Inagua",
        "cities": ["Matthew Town"]
      },
      {
        "name": "Long Island",
        "cities": ["Clarence Town", "Deadman's Cay", "Simms"]
      },
      {
        "name": "Mangrove Cay",
        "cities": ["Mangrove Cay", "Little Harbour"]
      },
      {
        "name": "Mayaguana",
        "cities": ["Abraham's Bay", "Pirate's Well"]
      },
      {
        "name": "Moore's Island",
        "cities": ["Hard Bargain", "The Bight"]
      },
      {
        "name": "North Abaco",
        "cities": ["Cooper's Town", "Crown Haven", "Fox Town"]
      },
      {
        "name": "North Andros",
        "cities": ["Nicholl's Town", "Mastic Point", "Red Bays"]
      },
      {
        "name": "North Eleuthera",
        "cities": ["North Eleuthera", "Spanish Wells", "Current"]
      },
      {
        "name": "Ragged Island",
        "cities": ["Duncan Town"]
      },
      {
        "name": "Rum Cay",
        "cities": ["Port Nelson"]
      },
      {
        "name": "San Salvador",
        "cities": ["Cockburn Town", "United Estates"]
      },
      {
        "name": "South Abaco",
        "cities": ["Sandy Point", "Cherokee Sound", "Crossing Rocks"]
      },
      {
        "name": "South Andros",
        "cities": ["Kemps Bay", "Long Bay", "Little Creek"]
      },
      {
        "name": "South Eleuthera",
        "cities": ["Rock Sound", "Tarpum Bay", "Wemyss Bight"]
      },
      {
        "name": "Spanish Wells",
        "cities": ["Spanish Wells"]
      },
      {
        "name": "West Grand Bahama",
        "cities": ["Eight Mile Rock", "Holmes Rock", "Pinder's Point"]
      }
    ]
  },
  //!!!TO BE REVISIT
  {
    "country": "Bahrain",
    "states": [
      {
        "name": "Capital Governorate",
        "cities": ["Manama", "Juffair", "Adliya", "Seef", "Bu Ashira"]
      },
      {
        "name": "Muharraq Governorate",
        "cities": ["Muharraq", "Arad", "Busaitin", "Hidd", "Halat Bu Maher"]
      },
      {
        "name": "Northern Governorate",
        "cities": ["Hamad Town", "Isa Town", "Budaiya", "Al Dar Islands", "Jidhafs"]
      },
      {
        "name": "Southern Governorate",
        "cities": ["Riffa", "Awali", "Zallaq", "Durrat Al Bahrain", "Sanad"]
      }
    ]
  },
  {
    "country": "Bangladesh",
    "states": [
      {
        "name": "Barisal",
        "cities": ["Barisal", "Patuakhali", "Pirojpur", "Bhola", "Jhalokati"]
      },
      {
        "name": "Chittagong",
        "cities": ["Chittagong", "Cox's Bazar", "Comilla", "Feni", "Rangamati"]
      },
      {
        "name": "Dhaka",
        "cities": ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur"]
      },
      {
        "name": "Khulna",
        "cities": ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Kushtia"]
      },
      {
        "name": "Mymensingh",
        "cities": ["Mymensingh", "Netrokona", "Jamalpur", "Sherpur"]
      },
      {
        "name": "Rajshahi",
        "cities": ["Rajshahi", "Bogra", "Pabna", "Sirajganj", "Naogaon"]
      },
      {
        "name": "Rangpur",
        "cities": ["Rangpur", "Dinajpur", "Nilphamari", "Lalmonirhat", "Kurigram"]
      },
      {
        "name": "Sylhet",
        "cities": ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"]
      }
    ]
  },
  {
    "country": "Barbados",
    "states": [
      {
        "name": "Christ Church",
        "cities": ["Oistins", "Bridgetown", "Hastings", "Worthing", "Maxwell"]
      },
      {
        "name": "Saint Andrew",
        "cities": ["Belleplaine", "Greenland", "Hillaby", "Morgan Lewis"]
      },
      {
        "name": "Saint George",
        "cities": ["Bulkeley", "Glebe Land", "The Crane", "Haggatt Hall"]
      },
      {
        "name": "Saint James",
        "cities": ["Holetown", "Fitts Village", "Paynes Bay", "Westmoreland"]
      },
      {
        "name": "Saint John",
        "cities": ["Four Roads", "Carter", "Ashford", "Gall Hill"]
      },
      {
        "name": "Saint Joseph",
        "cities": ["Bathsheba", "Cattlewash", "Chalky Mount", "Hackleton's Cliff"]
      },
      {
        "name": "Saint Lucy",
        "cities": ["Checker Hall", "Half Moon Fort", "Rock Hall", "Springfield"]
      },
      {
        "name": "Saint Michael",
        "cities": ["Bridgetown", "Speightstown", "Black Rock", "Wanstead"]
      },
      {
        "name": "Saint Peter",
        "cities": ["Speightstown", "Heywoods", "Six Men's Bay", "Maycock's Bay"]
      },
      {
        "name": "Saint Philip",
        "cities": ["Crane", "Sam Lord's Castle", "Bayfield", "Seawell"]
      },
      {
        "name": "Saint Thomas",
        "cities": ["Welchman Hall", "Clifton Hall", "Airy Hill", "Cottage"]
      }
    ]
  },
  {
    "country": "Belarus",
    "states": [
      {
        "name": "Brest Region",
        "cities": ["Brest", "Baranovichi", "Pinsk", "Kobrin", "Luninets"]
      },
      {
        "name": "Gomel Region",
        "cities": ["Gomel", "Mazyr", "Zhlobin", "Svetlahorsk", "Rechytsa"]
      },
      {
        "name": "Grodno Region",
        "cities": ["Grodno", "Lida", "Slonim", "Vawkavysk", "Navahrudak"]
      },
      {
        "name": "Minsk Region",
        "cities": ["Minsk", "Barysaw", "Salihorsk", "Maladzyechna", "Zhodzina"]
      },
      {
        "name": "Mogilev Region",
        "cities": ["Mogilev", "Babruysk", "Asipovichy", "Horki", "Krychaw"]
      },
      {
        "name": "Vitebsk Region",
        "cities": ["Vitebsk", "Orsha", "Navapolatsk", "Polatsk", "Pastavy"]
      },
      {
        "name": "Minsk City",
        "cities": ["Minsk"]
      }
    ]
  },
    {
      "country": "Belgium",
      "states": [
        {
          "name": "Antwerpen",
          "cities": ["Antwerp", "Mechelen", "Turnhout", "Lier", "Mol"]
        },
        {
          "name": "Brabant Wallon",
          "cities": ["Wavre", "Nivelles", "Tubize", "Ottignies-Louvain-la-Neuve", "Jodoigne"]
        },
        {
          "name": "Brussels",
          "cities": ["Brussels", "Schaerbeek", "Anderlecht", "Ixelles", "Uccle"]
        },
        {
          "name": "Flanders",
          "cities": ["Ghent", "Antwerp", "Bruges", "Leuven", "Hasselt"]
        },
        {
          "name": "Hainaut",
          "cities": ["Charleroi", "Mons", "Tournai", "La Louvière", "Mouscron"]
        },
        {
          "name": "Liege",
          "cities": ["Liège", "Verviers", "Seraing", "Herstal", "Eupen"]
        },
        {
          "name": "Limburg",
          "cities": ["Hasselt", "Genk", "Tongeren", "Beringen", "Maasmechelen"]
        },
        {
          "name": "Luxembourg",
          "cities": ["Arlon", "Bastogne", "Marche-en-Famenne", "Neufchâteau", "Virton"]
        },
        {
          "name": "Namur",
          "cities": ["Namur", "Dinant", "Philippeville", "Ciney", "Andenne"]
        },
        {
          "name": "Oost-Vlaanderen",
          "cities": ["Ghent", "Aalst", "Sint-Niklaas", "Dendermonde", "Oudenaarde"]
        },
        {
          "name": "Vlaams-Brabant",
          "cities": ["Leuven", "Halle", "Vilvoorde", "Tienen", "Diest"]
        },
        {
          "name": "Wallonia",
          "cities": ["Charleroi", "Liège", "Namur", "Mons", "Arlon"]
        },
        {
          "name": "West-Vlaanderen",
          "cities": ["Bruges", "Ostend", "Kortrijk", "Roeselare", "Ypres"]
        }
      ]
    },
   { "country": "Belize",
    "states": [
      {
        "name": "Belize",
        "cities": ["Belize City", "Ladyville", "San Pedro", "Caye Caulker", "Hattieville"]
      },
      {
        "name": "Cayo",
        "cities": ["San Ignacio", "Benque Viejo del Carmen", "Santa Elena", "Spanish Lookout", "Belmopan"]
      },
      {
        "name": "Corozal",
        "cities": ["Corozal Town", "Orange Walk", "San Joaquín", "Little Belize", "Xaibe"]
      },
      {
        "name": "Orange Walk",
        "cities": ["Orange Walk Town", "San Estevan", "San Pablo", "Guinea Grass", "August Pine Ridge"]
      },
      {
        "name": "Stann Creek",
        "cities": ["Dangriga", "Placencia", "Hopkins", "Maya Centre", "Sittee River"]
      },
      {
        "name": "Toledo",
        "cities": ["Punta Gorda", "San Antonio", "Big Falls", "Barranco", "Middlesex"]
      }
    ]
  },
  {
    "country": "Benin",
    "states": [
      {
        "name": "Alibori",
        "cities": ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"]
      },
      {
        "name": "Atakora",
        "cities": ["Boukoumbé", "Cobly", "Kérou", "Kouandé", "Matéri", "Natitingou", "Péhunco", "Tanguiéta", "Toucountouna"]
      },
      {
        "name": "Atlantique",
        "cities": ["Abomey-Calavi", "Allada", "Kpomassè", "Ouidah", "Sô-Ava", "Toffo", "Tori-Bossito", "Zè"]
      },
      {
        "name": "Borgou",
        "cities": ["Bembèrèkè", "Kalalé", "N'Dali", "Nikki", "Parakou", "Pèrèrè", "Sinendé", "Tchaourou"]
      },
      {
        "name": "Collines",
        "cities": ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savé"]
      },
      {
        "name": "Donga",
        "cities": ["Bassila", "Copargo", "Djougou Rural", "Djougou Urban", "Ouaké"]
      },
      {
        "name": "Kouffo",
        "cities": ["Aplahoué", "Djakotomey", "Klouékanmè", "Lalo", "Toviklin", "Dogbo-Tota"]
      },
      {
        "name": "Littoral",
        "cities": ["Cotonou"]
      },
      {
        "name": "Mono",
        "cities": ["Athiémé", "Bopa", "Comé", "Grand-Popo", "Houéyogbé", "Lokossa"]
      },
      {
        "name": "Ouémé",
        "cities": ["Adjarra", "Adjohoun", "Aguégués", "Akpro-Missérété", "Avrankou", "Bonou", "Dangbo", "Porto-Novo", "Sèmè-Kpodji"]
      },
      {
        "name": "Plateau",
        "cities": ["Ifangni", "Adja-Ouèrè", "Kétou", "Pobè", "Sakété"]
      },
      {
        "name": "Zou",
        "cities": ["Abomey", "Agbangnizoun", "Bohicon", "Cové", "Djidja", "Ouinhi", "Za-Kpota", "Zangnanado", "Zogbodomey"]
      }
    ]
  },
  {
    "country": "Bermuda",
    "states": [
      {
        "name": "Devonshire",
        "cities": ["Devonshire"]
      },
      {
        "name": "Hamilton",
        "cities": ["Bailey's Bay", "Flatts Village"]
      },
      {
        "name": "Paget",
        "cities": ["Paget"]
      },
      {
        "name": "Pembroke",
        "cities": ["Hamilton"]
      },
      {
        "name": "Sandys",
        "cities": ["Somerset Village", "Dockyard"]
      },
      {
        "name": "Smith's",
        "cities": ["Flatts"]
      },
      {
        "name": "Southampton",
        "cities": ["Southampton"]
      },
      {
        "name": "St. George's",
        "cities": ["St. George's", "Tucker's Town"]
      },
      {
        "name": "Warwick",
        "cities": ["Warwick"]
      }
    ]
  },
  {
    "country": "Bhutan",
    "states": [
      {
        "name": "Bumthang",
        "cities": ["Jakar", "Chhumey", "Tang", "Ura"]
      },
      {
        "name": "Chhukha",
        "cities": ["Phuentsholing", "Chhukha", "Gedu", "Tsimasham"]
      },
      {
        "name": "Dagana",
        "cities": ["Dagana", "Lhamoizingkha", "Tashiding"]
      },
      {
        "name": "Gasa",
        "cities": ["Gasa"]
      },
      {
        "name": "Haa",
        "cities": ["Haa", "Dumchoe"]
      },
      {
        "name": "Lhuntse",
        "cities": ["Lhuntse", "Minjey", "Autsho"]
      },
      {
        "name": "Mongar",
        "cities": ["Mongar", "Gyalpozhing", "Lingmethang"]
      },
      {
        "name": "Paro",
        "cities": ["Paro", "Drugyel Dzong", "Bondey"]
      },
      {
        "name": "Pemagatshel",
        "cities": ["Pemagatshel", "Nganglam"]
      },
      {
        "name": "Punakha",
        "cities": ["Punakha", "Khuru"]
      },
      {
        "name": "Samdrup Jongkhar",
        "cities": ["Samdrup Jongkhar", "Dewathang", "Jomotsangkha"]
      },
      {
        "name": "Samtse",
        "cities": ["Samtse", "Tendu", "Dorokha"]
      },
      {
        "name": "Sarpang",
        "cities": ["Gelephu", "Sarpang", "Shompangkha"]
      },
      {
        "name": "Thimphu",
        "cities": ["Thimphu", "Dechencholing", "Babesa"]
      },
      {
        "name": "Trashigang",
        "cities": ["Trashigang", "Kanglung", "Radi"]
      },
      {
        "name": "Trongsa",
        "cities": ["Trongsa", "Tangsibji"]
      },
      {
        "name": "Tsirang",
        "cities": ["Damphu", "Sergithang"]
      },
      {
        "name": "Wangdue Phodrang",
        "cities": ["Wangdue Phodrang", "Bajo"]
      },
      {
        "name": "Zhemgang",
        "cities": ["Zhemgang", "Tingtibi"]
      }
    ]
  },
  {
    "country": "Bolivia",
    "states": [
      {
        "name": "Beni",
        "cities": ["Trinidad", "Riberalta", "Guayaramerín", "San Borja", "Reyes"]
      },
      {
        "name": "Chuquisaca",
        "cities": ["Sucre", "Monteagudo", "Camargo", "Tarabuco", "Padilla"]
      },
      {
        "name": "Cochabamba",
        "cities": ["Cochabamba", "Quillacollo", "Sacaba", "Tiquipaya", "Villa Tunari"]
      },
      {
        "name": "La Paz",
        "cities": ["La Paz", "El Alto", "Viacha", "Achacachi", "Copacabana"]
      },
      {
        "name": "Oruro",
        "cities": ["Oruro", "Huanuni", "Challapata", "Eucaliptus", "Poopó"]
      },
      {
        "name": "Pando",
        "cities": ["Cobija", "Porvenir", "Puerto Rico", "Bella Flor", "Bolpebra"]
      },
      {
        "name": "Potosí",
        "cities": ["Potosí", "Uyuni", "Villazón", "Tupiza", "Llallagua"]
      },
      {
        "name": "Santa Cruz",
        "cities": ["Santa Cruz de la Sierra", "Montero", "Warnes", "Cotoca", "San Ignacio de Velasco"]
      },
      {
        "name": "Tarija",
        "cities": ["Tarija", "Yacuiba", "Bermejo", "Villamontes", "Entre Ríos"]
      }
    ]
  },
  {
    "country": "Bosnia and Herzegovina",
    "states": [
      {
        "name": "Una-Sana [Federation]",
        "cities": ["Bihać", "Cazin", "Velika Kladuša", "Sanski Most", "Kljuc", "Bosanska Krupa"]
      },
      {
        "name": "Posavina [Federation]",
        "cities": ["Orašje", "Domaljevac", "Bijeljina", "Šamac"]
      },
      {
        "name": "Tuzla [Federation]",
        "cities": ["Tuzla", "Srebrenik", "Lukavac", "Kalesija", "Gračanica"]
      },
      {
        "name": "Zenica-Doboj [Federation]",
        "cities": ["Zenica", "Zavidovići", "Visoko", "Maglaj", "Doboj", "Tešanj"]
      },
      {
        "name": "Bosnian Podrinje [Federation]",
        "cities": ["Goražde", "Foča", "Čajniče"]
      },
      {
        "name": "Central Bosnia [Federation]",
        "cities": ["Travnik", "Vitez", "Kiseljak", "Busovača", "Fojnica"]
      },
      {
        "name": "Herzegovina-Neretva [Federation]",
        "cities": ["Mostar", "Čapljina", "Konjic", "Neum", "Jablanica"]
      },
      {
        "name": "West Herzegovina [Federation]",
        "cities": ["Široki Brijeg", "Grude", "Posušje", "Ljubuški"]
      },
      {
        "name": "Sarajevo [Federation]",
        "cities": ["Sarajevo", "Ilidža", "Hadžići", "Stari Grad", "Novi Grad", "Vogošća"]
      },
      {
        "name": "West Bosnia [Federation]",
        "cities": ["Livno", "Tomislavgrad", "Kupres"]
      },
      {
        "name": "Banja Luka [RS]",
        "cities": ["Banja Luka", "Kotor Varoš", "Prijedor", "Laktaši", "Srpsko Sarajevo"]
      },
      {
        "name": "Bijeljina [RS]",
        "cities": ["Bijeljina", "Lopare", "Ugljevik"]
      },
      {
        "name": "Doboj [RS]",
        "cities": ["Doboj", "Teslić", "Modriča", "Srebrenica"]
      },
      {
        "name": "Foča [RS]",
        "cities": ["Foča", "Rogatica", "Sokolac"]
      },
      {
        "name": "Sarajevo-Romanija [RS]",
        "cities": ["Pale", "Sokolac", "Romanija"]
      },
      {
        "name": "Trebinje [RS]",
        "cities": ["Trebinje", "Bileća", "Nevesinje"]
      },
      {
        "name": "Vlasenica [RS]",
        "cities": ["Vlasenica", "Milići", "Bratunac"]
      }
    ]
  },
  {
    "country": "Botswana",
    "states": [
      {
        "name": "Central",
        "cities": ["Serowe", "Palapye", "Mochudi", "Letlhakane", "Mmathethe"]
      },
      {
        "name": "Ghanzi",
        "cities": ["Ghanzi", "D'Kar", "Tshane"]
      },
      {
        "name": "Kgalagadi",
        "cities": ["Kang", "Tsabong", "Mahalapye"]
      },
      {
        "name": "Kgatleng",
        "cities": ["Mochudi", "Bokaa", "Ramotswa"]
      },
      {
        "name": "Kweneng",
        "cities": ["Mogoditshane", "Thamaga", "Tlokweng", "Bokspits"]
      },
      {
        "name": "North East",
        "cities": ["Francistown", "Masunga", "Selebi-Phikwe"]
      },
      {
        "name": "North West",
        "cities": ["Maun", "Shakawe", "Kasane"]
      },
      {
        "name": "South East",
        "cities": ["Gaborone", "Mahalapye", "Mochudi", "Tlokweng"]
      },
      {
        "name": "Southern",
        "cities": ["Jwaneng", "Kang", "Mahalapye"]
      }
    ]
  },
  {
    "country": "Brazil",
    "states": [
      {
        "name": "Acre",
        "cities": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"]
      },
      {
        "name": "Alagoas",
        "cities": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Delmiro Gouveia", "Penedo"]
      },
      {
        "name": "Amapá",
        "cities": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande"]
      },
      {
        "name": "Amazonas",
        "cities": ["Manaus", "Parintins", "Itacoatiara", "Tefé", "Coari"]
      },
      {
        "name": "Bahia",
        "cities": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Ilhéus"]
      },
      {
        "name": "Ceará",
        "cities": ["Fortaleza", "Juazeiro do Norte", "Sobral", "Caucaia", "Crato"]
      },
      {
        "name": "Distrito Federal",
        "cities": ["Brasília"]
      },
      {
        "name": "Espirito Santo",
        "cities": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares"]
      },
      {
        "name": "Goias",
        "cities": ["Goiânia", "Anápolis", "Aparecida de Goiânia", "Rio Verde", "Catalão"]
      },
      {
        "name": "Maranhao",
        "cities": ["São Luís", "Imperatriz", "Caxias", "Codó", "Timon"]
      },
      {
        "name": "Mato Grosso",
        "cities": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"]
      },
      {
        "name": "Mato Grosso do Sul",
        "cities": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"]
      },
      {
        "name": "Minas Gerais",
        "cities": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Montes Claros"]
      },
      {
        "name": "Para",
        "cities": ["Belém", "Ananindeua", "Marabá", "Santarém", "Castanhal"]
      },
      {
        "name": "Paraiba",
        "cities": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"]
      },
      {
        "name": "Parana",
        "cities": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"]
      },
      {
        "name": "Pernambuco",
        "cities": ["Recife", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Petrolina"]
      },
      {
        "name": "Piaui",
        "cities": ["Teresina", "Parnaíba", "Piripiri", "Picos", "Floriano"]
      },
      {
        "name": "Rio de Janeiro",
        "cities": ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu"]
      },
      {
        "name": "Rio Grande do Norte",
        "cities": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Caicó"]
      },
      {
        "name": "Rio Grande do Sul",
        "cities": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria", "Canoas"]
      },
      {
        "name": "Rondonia",
        "cities": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"]
      },
      {
        "name": "Roraima",
        "cities": ["Boa Vista", "Rorainópolis", "Caracaraí", "Mucajaí", "Normandia"]
      },
      {
        "name": "Santa Catarina",
        "cities": ["Florianópolis", "Joinville", "Blumenau", "Chapecó", "Criciúma"]
      },
      {
        "name": "Sao Paulo",
        "cities": ["São Paulo", "Campinas", "Santo André", "São Bernardo do Campo", "Ribeirão Preto"]
      },
      {
        "name": "Sergipe",
        "cities": ["Aracaju", "Lagarto", "Itabaiana", "Nossa Senhora do Socorro", "Propriá"]
      },
      {
        "name": "Tocantins",
        "cities": ["Palmas", "Araguaína", "Gurupi", "Paraíso do Tocantins", "Porto Nacional"]
      }
    ]
  },

  {
  "country": "Brunei",
  "states": [
    {
      "name": "Belait",
      "cities": ["Kuala Belait", "Seria", "Lumut", "Pekan Tutong"]
    },
    {
      "name": "Brunei and Muara",
      "cities": ["Bandar Seri Begawan", "Kota Batu", "Muara", "Mentiri"]
    },
    {
      "name": "Temburong",
      "cities": ["Bangar", "Pekan Bangar", "Bukit Patoi"]
    },
    {
      "name": "Tutong",
      "cities": ["Tutong", "Pekan Tutong", "Serambangun"]
    }
  ]
},

{
  "country": "Bulgaria",
  "states": [
    {
      "name": "Blagoevgrad",
      "cities": ["Blagoevgrad", "Petrich", "Sandanski", "Gotse Delchev", "Kresna"]
    },
    {
      "name": "Burgas",
      "cities": ["Burgas", "Pomorie", "Nessebar", "Sozopol", "Kiten"]
    },
    {
      "name": "Dobrich",
      "cities": ["Dobrich", "Balchik", "General Toshevo", "Kavarna", "Tervel"]
    },
    {
      "name": "Gabrovo",
      "cities": ["Gabrovo", "Dryanovo", "Sevlievo", "Suvorovo", "Lovech"]
    },
    {
      "name": "Khaskovo",
      "cities": ["Haskovo", "Dimitrovgrad", "Mezdra", "Harmanli", "Svilengrad"]
    },
    {
      "name": "Kurdzhali",
      "cities": ["Kardzhali", "Momchilgrad", "Dzhebel", "Chernootsi", "Krumovgrad"]
    },
    {
      "name": "Kyustendil",
      "cities": ["Kyustendil", "Dupnitsa", "Boboshevo", "Simitli", "Zemen"]
    },
    {
      "name": "Lovech",
      "cities": ["Lovech", "Troyan", "Lukovit", "Levski", "Pleven"]
    },
    {
      "name": "Montana",
      "cities": ["Montana", "Berkovitsa", "Vratsa", "Mezdra", "Chiprovtsi"]
    },
    {
      "name": "Pazardzhik",
      "cities": ["Pazardzhik", "Velingrad", "Septemvri", "Panagyurishte", "Berkovitsa"]
    },
    {
      "name": "Pernik",
      "cities": ["Pernik", "Radomir", "Kovachevtsi", "Zemen", "Bobov Dol"]
    },
    {
      "name": "Pleven",
      "cities": ["Pleven", "Cherven Bryag", "Dolna Mitropolia", "Gulyantsi", "Knezha"]
    },
    {
      "name": "Plovdiv",
      "cities": ["Plovdiv", "Asenovgrad", "Kardzhali", "Hissarya", "Brezovo"]
    },
    {
      "name": "Razgrad",
      "cities": ["Razgrad", "Isperih", "Kubrat", "Tsenovo", "Zavet"]
    },
    {
      "name": "Ruse",
      "cities": ["Ruse", "Alfatar", "Borovo", "Ivanovo", "Slivo Pole"]
    },
    {
      "name": "Shumen",
      "cities": ["Shumen", "Veliki Preslav", "Varna", "Targovishte", "Provadia"]
    },
    {
      "name": "Silistra",
      "cities": ["Silistra", "Tutrakan", "Glavinitsa", "Kaynardzha", "Srebŭrna"]
    },
    {
      "name": "Sliven",
      "cities": ["Sliven", "Kermen", "Nova Zagora", "Tvarditsa", "Zheravna"]
    },
    {
      "name": "Smolyan",
      "cities": ["Smolyan", "Pamporovo", "Chepelare", "Zlatograd", "Rudozem"]
    },
    {
      "name": "Sofiya",
      "cities": ["Sofia", "Bozhurishte", "Dragoman", "Samokov", "Svoge"]
    },
    {
      "name": "Sofiya-Grad",
      "cities": ["Sofia"]
    },
    {
      "name": "Stara Zagora",
      "cities": ["Stara Zagora", "Gurkovo", "Kazanlak", "Radnevo", "Maglizh"]
    },
    {
      "name": "Turgovishte",
      "cities": ["Turgovishte", "Omurtag", "Popovo", "Antonovo", "Opaka"]
    },
    {
      "name": "Varna",
      "cities": ["Varna", "Aksakovo", "Provadia", "Vetrino", "Dulboka"]
    },
    {
      "name": "Veliko Turnovo",
      "cities": ["Veliko Tarnovo", "Gorna Oryahovitsa", "Suhindol", "Lyaskovets", "Polski Trambesh"]
    },
    {
      "name": "Vidin",
      "cities": ["Vidin", "Kula", "Belogradchik", "Dimovo", "Bregovo"]
    },
    {
      "name": "Vratsa",
      "cities": ["Vratsa", "Mezdra", "Kozloduy", "Bojurishte", "Gorna Malina"]
    },
    {
      "name": "Yambol",
      "cities": ["Yambol", "Elhovo", "Straldzha", "Bolyarovo", "Simeonovgrad"]
    }
  ]
},
{
  "country": "Burkina Faso",
  "states": [
    {
      "name": "Bale",
      "cities": ["Bobo-Dioulasso", "Dédougou", "Bouroum-Bouroum", "Koudougou", "Banfora"]
    },
    {
      "name": "Bam",
      "cities": ["Nouna", "Kouka", "Sinsoubougou", "Titao", "Réo"]
    },
    {
      "name": "Banwa",
      "cities": ["Koudougou", "Nouna", "Réo", "Bobo-Dioulasso", "Tiao"]
    },
    {
      "name": "Bazega",
      "cities": ["Zorgho", "Boussouma", "Manga", "Tenkodogo", "Bogandé"]
    },
    {
      "name": "Bougouriba",
      "cities": ["Diébougou", "Manga", "Batié", "Bougouriba"]
    },
    {
      "name": "Boulgou",
      "cities": ["Tenkodogo", "Zorgho", "Boussouma"]
    },
    {
      "name": "Boulkiemde",
      "cities": ["Koudougou", "Bobo-Dioulasso", "Zorgho", "Banfora"]
    },
    {
      "name": "Comoe",
      "cities": ["Banfora", "Sindou", "Koro", "Bobo-Dioulasso"]
    },
    {
      "name": "Ganzourgou",
      "cities": ["Zorgho", "Manga", "Tenkodogo", "Boussouma"]
    },
    {
      "name": "Gnagna",
      "cities": ["Bogandé", "Fada N'Gourma", "Tibga"]
    },
    {
      "name": "Gourma",
      "cities": ["Fada N'Gourma", "Bogandé", "Tibga"]
    },
    {
      "name": "Houet",
      "cities": ["Bobo-Dioulasso", "Sya", "Mouhoun"]
    },
    {
      "name": "Ioba",
      "cities": ["Diébougou", "Siby", "Bougouriba"]
    },
    {
      "name": "Kadiogo",
      "cities": ["Ouagadougou", "Tenkodogo", "Saponé", "Sya"]
    },
    {
      "name": "Kenedougou",
      "cities": ["Banfora", "Sindou", "Koro"]
    },
    {
      "name": "Komondjari",
      "cities": ["Fada N'Gourma", "Kongoussi", "Salogo"]
    },
    {
      "name": "Kompienga",
      "cities": ["Tenkodogo", "Fada N'Gourma", "Boussé"]
    },
    {
      "name": "Kossi",
      "cities": ["Nouna", "Réo", "Bobo-Dioulasso"]
    },
    {
      "name": "Koulpelogo",
      "cities": ["Bobo-Dioulasso", "Tenkodogo", "Manga"]
    },
    {
      "name": "Kouritenga",
      "cities": ["Tenkodogo", "Koudougou"]
    },
    {
      "name": "Kourweogo",
      "cities": ["Zorgho", "Tenkodogo", "Boussouma"]
    },
    {
      "name": "Leraba",
      "cities": ["Diébougou", "Banfora"]
    },
    {
      "name": "Loroum",
      "cities": ["Koudougou", "Nouna", "Bobo-Dioulasso"]
    },
    {
      "name": "Mouhoun",
      "cities": ["Koudougou", "Diébougou", "Banfora"]
    },
    {
      "name": "Namentenga",
      "cities": ["Zorgho", "Manga"]
    },
    {
      "name": "Nahouri",
      "cities": ["Tenkodogo", "Zorgho", "Boussouma"]
    },
    {
      "name": "Nayala",
      "cities": ["Bobo-Dioulasso", "Diébougou"]
    },
    {
      "name": "Noumbiel",
      "cities": ["Banfora", "Sindou", "Bougouriba"]
    },
    {
      "name": "Oubritenga",
      "cities": ["Bobo-Dioulasso", "Bougouriba"]
    },
    {
      "name": "Oudalan",
      "cities": ["Dori", "Titao", "Oudalan"]
    },
    {
      "name": "Passore",
      "cities": ["Bobo-Dioulasso", "Koudougou", "Zorgho"]
    },
    {
      "name": "Poni",
      "cities": ["Diébougou", "Banfora"]
    },
    {
      "name": "Sanguie",
      "cities": ["Bobo-Dioulasso", "Réo"]
    },
    {
      "name": "Sanmatenga",
      "cities": ["Zorgho", "Boussouma", "Manga"]
    },
    {
      "name": "Seno",
      "cities": ["Dori", "Titao", "Fada N'Gourma"]
    },
    {
      "name": "Sissili",
      "cities": ["Zorgho", "Boussouma"]
    },
    {
      "name": "Soum",
      "cities": ["Dori", "Titao"]
    },
    {
      "name": "Sourou",
      "cities": ["Nouna", "Réo"]
    },
    {
      "name": "Tapoa",
      "cities": ["Fada N'Gourma", "Bogandé"]
    },
    {
      "name": "Tuy",
      "cities": ["Banfora", "Diébougou"]
    },
    {
      "name": "Yagha",
      "cities": ["Fada N'Gourma", "Tibga"]
    },
    {
      "name": "Yatenga",
      "cities": ["Ouahigouya", "Dori"]
    },
    {
      "name": "Ziro",
      "cities": ["Bobo-Dioulasso", "Diébougou"]
    },
    {
      "name": "Zondoma",
      "cities": ["Koudougou", "Bobo-Dioulasso"]
    },
    {
      "name": "Zoundweogo",
      "cities": ["Zorgho", "Manga"]
    }
  ]
},
{
  "country": "Burma",
  "states": [
    {
      "name": "Ayeyarwady",
      "cities": ["Pathein", "Myaungmya", "Bassein", "Ngathainggyaung", "Pantanaw"]
    },
    {
      "name": "Bago",
      "cities": ["Bago", "Kyaukse", "Tharrawaddy", "Nyaunglebin", "Zigon"]
    },
    {
      "name": "Magway",
      "cities": ["Magway", "Pakokku", "Myingyan", "Chauk", "Minbu"]
    },
    {
      "name": "Mandalay",
      "cities": ["Mandalay", "Amarapura", "Pyin Oo Lwin", "Meiktila", "Myaing"]
    },
    {
      "name": "Sagaing",
      "cities": ["Sagaing", "Monywa", "Shwebo", "Kalewa", "Pale"]
    },
    {
      "name": "Tanintharyi",
      "cities": ["Dawei", "Myeik", "Tanintharyi", "Kyunsu", "Bokpyin"]
    },
    {
      "name": "Yangon",
      "cities": ["Yangon", "Bago", "Pyay", "Hpa-An", "Mawlamyine"]
    },
    {
      "name": "Chin State",
      "cities": ["Hakha", "Falam", "Matupi", "Mindat", "Rihkhawdar"]
    },
    {
      "name": "Kachin State",
      "cities": ["Myitkyina", "Bhamo", "Shwegu", "Indaw", "Mansi"]
    },
    {
      "name": "Kayin State",
      "cities": ["Hpa-An", "Myawaddy", "Kawkareik", "Kyainseikgyi", "Palaw"]
    },
    {
      "name": "Kayah State",
      "cities": ["Loikaw", "Demoso", "Bawlakhe", "Shadaw", "Mese"]
    },
    {
      "name": "Mon State",
      "cities": ["Mawlamyine", "Thanbyuzayat", "Kyaikto", "Bilin", "Ye"]
    },
    {
      "name": "Rakhine State",
      "cities": ["Sittwe", "Mrauk U", "Kyaukphyu", "Thandwe", "Maungdaw"]
    },
    {
      "name": "Shan State",
      "cities": ["Taunggyi", "Mong Hsat", "Lashio", "Kengtung", "Namhsan"]
    }
  ]
},
{
  "country": "Burundi",
  "states": [
    {
      "name": "Bubanza",
      "cities": ["Bubanza", "Rugombo", "Mpanda", "Songa"]
    },
    {
      "name": "Bujumbura Mairie",
      "cities": ["Bujumbura"]
    },
    {
      "name": "Bujumbura Rural",
      "cities": ["Mutimbuzi", "Isale", "Mabayi", "Kabezi"]
    },
    {
      "name": "Bururi",
      "cities": ["Bururi", "Vyasaze", "Kibago", "Rutovu"]
    },
    {
      "name": "Cankuzo",
      "cities": ["Cankuzo", "Mugongo", "Kibago", "Matana"]
    },
    {
      "name": "Cibitoke",
      "cities": ["Cibitoke", "Kabezi", "Bujumbura", "Mpanda"]
    },
    {
      "name": "Gitega",
      "cities": ["Gitega", "Bujumbura", "Kiganda", "Nyabihanga"]
    },
    {
      "name": "Karuzi",
      "cities": ["Karuzi", "Giteranyi", "Nyakibiga", "Mutimbuzi"]
    },
    {
      "name": "Kayanza",
      "cities": ["Kayanza", "Muyinga", "Kirundo", "Ruyigi"]
    },
    {
      "name": "Kirundo",
      "cities": ["Kirundo", "Bubanza", "Ruyigi", "Mugamba"]
    },
    {
      "name": "Makamba",
      "cities": ["Makamba", "Mugamba", "Mutambara", "Nyanza-Lac"]
    },
    {
      "name": "Muramvya",
      "cities": ["Muramvya", "Rutegama", "Gitega", "Nyabihanga"]
    },
    {
      "name": "Muyinga",
      "cities": ["Muyinga", "Ruyigi", "Bubanza", "Makamba"]
    },
    {
      "name": "Mwaro",
      "cities": ["Mwaro", "Nyakibiga", "Giteranyi"]
    },
    {
      "name": "Ngozi",
      "cities": ["Ngozi", "Kayanza", "Ruyigi", "Kirundo"]
    },
    {
      "name": "Rutana",
      "cities": ["Rutana", "Kiganda", "Mugamba"]
    },
    {
      "name": "Ruyigi",
      "cities": ["Ruyigi", "Muyinga", "Karuzi", "Kirundo"]
    }
  ]
},
  {
    "country": "Cambodia",
    "states": [
      {
        "name": "Banteay Mean Chey",
        "cities": ["Sisophon", "Poipet", "Mongkol Borei", "Thma Puok", "Malai"]
      },
      {
        "name": "Batdambang",
        "cities": ["Battambang", "Banlung", "Siem Reap", "Pailin", "Samlout"]
      },
      {
        "name": "Kampong Cham",
        "cities": ["Kampong Cham", "Tbong Khmum", "Krouch Chhmar", "Memot", "Kampong Siem"]
      },
      {
        "name": "Kampong Chhnang",
        "cities": ["Kampong Chhnang", "Rolea B'ier", "Baribour", "Samaki Meanchey", "Kampong Leaeng"]
      },
      {
        "name": "Kampong Spoe",
        "cities": ["Kampong Speu", "Chbar Mon", "Kong Pisei", "Phnom Sruoch", "Thpong"]
      },
      {
        "name": "Kampong Thum",
        "cities": ["Kampong Thom", "Stueng Saen", "Baray", "Prasat Balangk", "Sambor"]
      },
      {
        "name": "Kampot",
        "cities": ["Kampot", "Kep", "Bokor", "Chhouk", "Dang Tong"]
      },
      {
        "name": "Kandal",
        "cities": ["Ta Khmau", "Kien Svay", "Angk Snuol", "Koh Thom", "Mukh Kampul"]
      },
      {
        "name": "Koh Kong",
        "cities": ["Koh Kong", "Sre Ambel", "Khemarak Phoumin", "Thma Bang", "Botum Sakor"]
      },
      {
        "name": "Kracheh",
        "cities": ["Kratié", "Snuol", "Chhloung", "Preaek Prasab", "Chetr Borei"]
      },
      {
        "name": "Mondol Kiri",
        "cities": ["Sen Monorom", "Kaev Seima", "Ou Reang", "Pechreada", "Keo Seima"]
      },
      {
        "name": "Otdar Mean Chey",
        "cities": ["Samraong", "Anlong Veng", "Banteay Ampil", "Trapeang Prasat", "Kouk Mon"]
      },
      {
        "name": "Pouthisat",
        "cities": ["Pursat", "Krakor", "Veal Veaeng", "Kandieng", "Phnum Kravanh"]
      },
      {
        "name": "Preah Vihear",
        "cities": ["Preah Vihear", "Chey Saen", "Chhaeb", "Kuleaen", "Rovieng"]
      },
      {
        "name": "Prey Veng",
        "cities": ["Prey Veng", "Ba Phnum", "Kamchay Mear", "Kampong Leav", "Peam Chor"]
      },
      {
        "name": "Rotanakir",
        "cities": ["Banlung", "Andong Meas", "Bar Kaev", "Koun Mom", "Lumphat"]
      },
      {
        "name": "Siem Reab",
        "cities": ["Siem Reap", "Angkor Chum", "Angkor Thum", "Banteay Srei", "Kralanh"]
      },
      {
        "name": "Stoeng Treng",
        "cities": ["Stung Treng", "Sesan", "Siem Pang", "Thala Barivat", "Siem Bok"]
      },
      {
        "name": "Svay Rieng",
        "cities": ["Svay Rieng", "Chantrea", "Kampong Rou", "Romeas Haek", "Svay Teab"]
      },
      {
        "name": "Takao",
        "cities": ["Takeo", "Angkor Borei", "Bati", "Kirivong", "Prey Kabbas"]
      },
      {
        "name": "Keb",
        "cities": ["Kep", "Damnak Chang'aeur", "Kep City", "Pong Tuek", "Prey Thom"]
      },
      {
        "name": "Pailin",
        "cities": ["Pailin", "Sala Krau", "Stung Kach", "O'Krieng", "Pailin City"]
      },
      {
        "name": "Phnom Penh",
        "cities": ["Phnom Penh", "Chbar Ampov", "Dangkao", "Mean Chey", "Russey Keo"]
      },
      {
        "name": "Preah Seihanu",
        "cities": ["Sihanoukville", "Prey Nob", "Stueng Hav", "Kampong Seila", "Veal Renh"]
      }
    ]
  },
  {
    "country": "Cameroon",
    "states": [
      {
        "name": "Adamaoua",
        "cities": ["Ngaoundéré", "Meiganga", "Tibati", "Banyo", "Djohong"]
      },
      {
        "name": "Centre",
        "cities": ["Yaoundé", "Mbalmayo", "Bafia", "Akonolinga", "Obala"]
      },
      {
        "name": "Est",
        "cities": ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Garoua-Boulaï"]
      },
      {
        "name": "Extreme-Nord",
        "cities": ["Maroua", "Kousséri", "Mora", "Yagoua", "Mokolo"]
      },
      {
        "name": "Littoral",
        "cities": ["Douala", "Nkongsamba", "Edéa", "Loum", "Manjo"]
      },
      {
        "name": "Nord",
        "cities": ["Garoua", "Poli", "Guider", "Figuil", "Lagdo"]
      },
      {
        "name": "Nord-Ouest",
        "cities": ["Bamenda", "Kumbo", "Wum", "Nkambe", "Mbengwi"]
      },
      {
        "name": "Ouest",
        "cities": ["Bafoussam", "Dschang", "Foumban", "Mbouda", "Bangangté"]
      },
      {
        "name": "Sud",
        "cities": ["Ebolowa", "Sangmélima", "Mvangan", "Akom II", "Ambam"]
      },
      {
        "name": "Sud-Ouest",
        "cities": ["Buea", "Limbe", "Kumba", "Tiko", "Mamfe"]
      }
    ]
  },
    {
      "country": "Canada",
      "code": "ca",
      "states": [
        {
          "name": "Alberta",
          "cities": ["Edmonton", "Calgary", "Red Deer", "Lethbridge", "Fort McMurray"]
        },
        {
          "name": "British Columbia",
          "cities": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"]
        },
        {
          "name": "Manitoba",
          "cities": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Morden"]
        },
        {
          "name": "New Brunswick",
          "cities": ["Fredericton", "Moncton", "Saint John", "Dieppe", "Miramichi"]
        },
        {
          "name": "Newfoundland and Labrador",
          "cities": ["St. John's", "Mount Pearl", "Corner Brook", "Gander", "Happy Valley-Goose Bay"]
        },
        {
          "name": "Northwest Territories",
          "cities": ["Yellowknife", "Hay River", "Inuvik", "Fort Simpson", "Tuktoyaktuk"]
        },
        {
          "name": "Nova Scotia",
          "cities": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow"]
        },
        {
          "name": "Nunavut",
          "cities": ["Iqaluit", "Rankin Inlet", "Arviat", "Baker Lake", "Repulse Bay"]
        },
        {
          "name": "Ontario",
          "cities": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton"]
        },
        {
          "name": "Prince Edward Island",
          "cities": ["Charlottetown", "Summerside", "Cornwall", "Stratford", "Montague"]
        },
        {
          "name": "Quebec",
          "cities": ["Montreal", "Quebec City", "Laval", "Gatineau", "Trois-Rivières"]
        },
        {
          "name": "Saskatchewan",
          "cities": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current"]
        },
        {
          "name": "Yukon Territory",
          "cities": ["Whitehorse", "Dawson City", "Haines Junction", "Teslin", "Beaver Creek"]
        }
      ]
    },
    {
      "country": "Cape Verde",
      "states": []
    },
    {
      "country": "Central African Republic",
      "states": [
        {
          "name": "Bamingui-Bangoran",
          "cities": ["Ndele", "Mongoumba", "Bria"]
        },
        {
          "name": "Bangui",
          "cities": ["Bangui"]
        },
        {
          "name": "Basse-Kotto",
          "cities": ["Zemio", "Mboki", "Mbaiki"]
        },
        {
          "name": "Haute-Kotto",
          "cities": ["Bongoro", "Rafai", "Kaga-Bandoro"]
        },
        {
          "name": "Haut-Mbomou",
          "cities": ["Bangassou", "Obo", "Hileal"]
        },
        {
          "name": "Kemo",
          "cities": ["Sibut", "Bakel", "Bria"]
        },
        {
          "name": "Lobaye",
          "cities": ["Mbaiki", "Bata", "Nola"]
        },
        {
          "name": "Mambere-Kadei",
          "cities": ["Berbérati", "Carnot", "Boda"]
        },
        {
          "name": "Mbomou",
          "cities": ["Bangassou", "Obo", "Gadzi"]
        },
        {
          "name": "Nana-Grebizi",
          "cities": ["Kaga-Bandoro", "Mbomou", "Bangassou"]
        },
        {
          "name": "Nana-Mambere",
          "cities": ["Boda", "Berbérati", "Binguila"]
        },
        {
          "name": "Ombella-Mpoko",
          "cities": ["Bimbo", "Yaloke", "Bocaranga"]
        },
        {
          "name": "Ouaka",
          "cities": ["Alindao", "Rafaï", "Bangassou"]
        },
        {
          "name": "Ouham",
          "cities": ["Bossangoa", "Bozoum", "Kabo"]
        },
        {
          "name": "Ouham-Pende",
          "cities": ["Bouar", "Birao", "Sibut"]
        },
        {
          "name": "Sangha-Mbaere",
          "cities": ["Nola", "Mambéré-Kadéï", "Bata"]
        },
        {
          "name": "Vakaga",
          "cities": ["Birao"]
        }
      ]
    },
      {
        "country": "Chad",
        "states": [
          {
            "name": "Batha",
            "cities": ["Ati", "Oum Hadjer", "Djedaa", "Am Sack", "Haraze"]
          },
          {
            "name": "Biltine",
            "cities": ["Biltine", "Guéréda", "Iriba", "Am Zoer", "Arada"]
          },
          {
            "name": "Borkou-Ennedi-Tibesti",
            "cities": ["Faya-Largeau", "Bardaï", "Zouar", "Kirdimi", "Yebbi Bou"]
          },
          {
            "name": "Chari-Baguirmi",
            "cities": ["N'Djamena", "Bousso", "Massakory", "Massenya", "Ngoura"]
          },
          {
            "name": "Guéra",
            "cities": ["Mongo", "Bitkine", "Melfi", "Baro", "Kouka Margni"]
          },
          {
            "name": "Kanem",
            "cities": ["Mao", "Nokou", "Kekedina", "Rig Rig", "Ziguey"]
          },
          {
            "name": "Lac",
            "cities": ["Bol", "Ngouri", "Liwa", "Kouloudia", "Doum Doum"]
          },
          {
            "name": "Logone Occidental",
            "cities": ["Moundou", "Beinamar", "Benoye", "Laï", "Doba"]
          },
          {
            "name": "Logone Oriental",
            "cities": ["Doba", "Bébédjia", "Kélo", "Baïbokoum", "Gore"]
          },
          {
            "name": "Mayo-Kebbi",
            "cities": ["Bongor", "Fianga", "Gounou Gaya", "Léré", "Pala"]
          },
          {
            "name": "Moyen-Chari",
            "cities": ["Sarh", "Koumra", "Kyabé", "Maro", "Moïssala"]
          },
          {
            "name": "Ouaddaï",
            "cities": ["Abéché", "Adré", "Goz Beïda", "Am Dam", "Abdi"]
          },
          {
            "name": "Salamat",
            "cities": ["Am Timan", "Aboudeïa", "Haraze Mangueigne", "Mangueigne", "Daha"]
          },
          {
            "name": "Tandjilé",
            "cities": ["Laï", "Béré", "Kélo", "Bénoye", "Gounou Gaya"]
          }
        ]
      },
      {
        "country": "Chile",
        "states": [
          {
            "name": "Aysen",
            "cities": ["Coyhaique", "Puerto Aysén", "Chile Chico", "Puerto Cisnes", "Villa O'Higgins"]
          },
          {
            "name": "Antofagasta",
            "cities": ["Antofagasta", "Calama", "Tocopilla", "Mejillones", "San Pedro de Atacama"]
          },
          {
            "name": "Araucania",
            "cities": ["Temuco", "Padre Las Casas", "Villarrica", "Angol", "Pucón"]
          },
          {
            "name": "Atacama",
            "cities": ["Copiapó", "Vallenar", "Caldera", "Chañaral", "Diego de Almagro"]
          },
          {
            "name": "Bio-Bio",
            "cities": ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel"]
          },
          {
            "name": "Coquimbo",
            "cities": ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"]
          },
          {
            "name": "O'Higgins",
            "cities": ["Rancagua", "San Fernando", "Machalí", "Santa Cruz", "Pichilemu"]
          },
          {
            "name": "Los Lagos",
            "cities": ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas"]
          },
          {
            "name": "Magallanes y la Antartica Chilena",
            "cities": ["Punta Arenas", "Puerto Natales", "Porvenir", "Puerto Williams", "Cabo de Hornos"]
          },
          {
            "name": "Maule",
            "cities": ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes"]
          },
          {
            "name": "Santiago Region Metropolitana",
            "cities": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes"]
          },
          {
            "name": "Tarapaca",
            "cities": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Huara", "Camiña"]
          },
          {
            "name": "Valparaiso",
            "cities": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"]
          }
        ]
      },
      {
        "country": "China",
        "states": [
          {
            "name": "Anhui",
            "cities": ["Hefei", "Wuhu", "Bengbu", "Huainan", "Ma'anshan"]
          },
          {
            "name": "Fujian",
            "cities": ["Fuzhou", "Xiamen", "Quanzhou", "Zhangzhou", "Putian"]
          },
          {
            "name": "Gansu",
            "cities": ["Lanzhou", "Tianshui", "Baiyin", "Jiayuguan", "Jinchang"]
          },
          {
            "name": "Guangdong",
            "cities": ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhuhai"]
          },
          {
            "name": "Guizhou",
            "cities": ["Guiyang", "Zunyi", "Liupanshui", "Anshun", "Bijie"]
          },
          {
            "name": "Hainan",
            "cities": ["Haikou", "Sanya", "Wenchang", "Qionghai", "Wanning"]
          },
          {
            "name": "Hebei",
            "cities": ["Shijiazhuang", "Tangshan", "Baoding", "Handan", "Qinhuangdao"]
          },
          {
            "name": "Heilongjiang",
            "cities": ["Harbin", "Qiqihar", "Daqing", "Mudanjiang", "Jiamusi"]
          },
          {
            "name": "Henan",
            "cities": ["Zhengzhou", "Luoyang", "Kaifeng", "Xinxiang", "Anyang"]
          },
          {
            "name": "Hubei",
            "cities": ["Wuhan", "Xiangyang", "Yichang", "Jingzhou", "Shiyan"]
          },
          {
            "name": "Hunan",
            "cities": ["Changsha", "Zhuzhou", "Xiangtan", "Hengyang", "Yueyang"]
          },
          {
            "name": "Jiangsu",
            "cities": ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong"]
          },
          {
            "name": "Jiangxi",
            "cities": ["Nanchang", "Jiujiang", "Ganzhou", "Shangrao", "Jingdezhen"]
          },
          {
            "name": "Jilin",
            "cities": ["Changchun", "Jilin", "Siping", "Liaoyuan", "Tonghua"]
          },
          {
            "name": "Liaoning",
            "cities": ["Shenyang", "Dalian", "Anshan", "Fushun", "Jinzhou"]
          },
          {
            "name": "Qinghai",
            "cities": ["Xining", "Haidong", "Golmud", "Yushu", "Delingha"]
          },
          {
            "name": "Shaanxi",
            "cities": ["Xi'an", "Baoji", "Xianyang", "Weinan", "Hanzhong"]
          },
          {
            "name": "Shandong",
            "cities": ["Jinan", "Qingdao", "Zibo", "Yantai", "Weifang"]
          },
          {
            "name": "Shanxi",
            "cities": ["Taiyuan", "Datong", "Yangquan", "Changzhi", "Jincheng"]
          },
          {
            "name": "Sichuan",
            "cities": ["Chengdu", "Mianyang", "Leshan", "Yibin", "Nanchong"]
          },
          {
            "name": "Yunnan",
            "cities": ["Kunming", "Qujing", "Yuxi", "Dali", "Baoshan"]
          },
          {
            "name": "Zhejiang",
            "cities": ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing", "Huzhou"]
          },
          {
            "name": "Guangxi",
            "cities": ["Nanning", "Liuzhou", "Guilin", "Wuzhou", "Beihai"]
          },
          {
            "name": "Nei Mongol",
            "cities": ["Hohhot", "Baotou", "Chifeng", "Ordos", "Hulunbuir"]
          },
          {
            "name": "Ningxia",
            "cities": ["Yinchuan", "Shizuishan", "Wuzhong", "Guyuan", "Zhongwei"]
          },
          {
            "name": "Xinjiang",
            "cities": ["Ürümqi", "Karamay", "Turpan", "Kashgar", "Ili"]
          },
          {
            "name": "Xizang (Tibet)",
            "cities": ["Lhasa", "Shigatse", "Nyingchi", "Qamdo", "Ngari"]
          },
          {
            "name": "Beijing",
            "cities": ["Beijing"]
          },
          {
            "name": "Chongqing",
            "cities": ["Chongqing"]
          },
          {
            "name": "Shanghai",
            "cities": ["Shanghai"]
          },
          {
            "name": "Tianjin",
            "cities": ["Tianjin"]
          }
        ]
      },
      {
        "country": "Colombia",
        "states": [
          {
            "name": "Amazonas",
            "cities": ["Leticia", "Puerto Nariño", "La Chorrera", "La Pedrera", "Tarapacá"]
          },
          {
            "name": "Antioquia",
            "cities": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Rionegro"]
          },
          {
            "name": "Arauca",
            "cities": ["Arauca", "Saravena", "Tame", "Fortul", "Arauquita"]
          },
          {
            "name": "Atlantico",
            "cities": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia"]
          },
          {
            "name": "Bogota District Capital",
            "cities": ["Bogotá"]
          },
          {
            "name": "Bolivar",
            "cities": ["Cartagena", "Magangué", "Carmen de Bolívar", "Turbaco", "Arjona"]
          },
          {
            "name": "Boyaca",
            "cities": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"]
          }
        ]
      },
      {
        "country": "Comoros",
        "states": [
          {
            "name": "Grande Comore (Njazidja)",
            "cities": ["Moroni", "Mitsamiouli", "Foumbouni", "Mbeni", "Iconi"]
          },
          {
            "name": "Anjouan (Nzwani)",
            "cities": ["Mutsamudu", "Domoni", "Sima", "Ouani", "Tsembehou"]
          },
          {
            "name": "Moheli (Mwali)",
            "cities": ["Fomboni", "Nioumachoua", "Wanani", "Hoani", "Miringoni"]
          }
        ]
      },
      {
        "country": "Congo, Democratic Republic",
        "states": [
          {
            "name": "Bandundu",
            "cities": ["Bandundu", "Kikwit", "Bulungu", "Bolobo", "Inongo"]
          },
          {
            "name": "Bas-Congo",
            "cities": ["Matadi", "Boma", "Moanda", "Tshela", "Mbanza-Ngungu"]
          },
          {
            "name": "Equateur",
            "cities": ["Mbandaka", "Bikoro", "Basankusu", "Gemena", "Zongo"]
          },
          {
            "name": "Kasai-Occidental",
            "cities": ["Kananga", "Tshikapa", "Demba", "Luebo", "Ilebo"]
          },
          {
            "name": "Kasai-Oriental",
            "cities": ["Mbuji-Mayi", "Mwene-Ditu", "Kabinda", "Lusambo", "Tshilenge"]
          },
          {
            "name": "Katanga",
            "cities": ["Lubumbashi", "Likasi", "Kolwezi", "Kamina", "Kipushi"]
          },
          {
            "name": "Kinshasa",
            "cities": ["Kinshasa"]
          },
          {
            "name": "Maniema",
            "cities": ["Kindu", "Kasongo", "Kalima", "Punia", "Lubutu"]
          },
          {
            "name": "Nord-Kivu",
            "cities": ["Goma", "Butembo", "Beni", "Rutshuru", "Masisi"]
          },
          {
            "name": "Orientale",
            "cities": ["Kisangani", "Bunia", "Isiro", "Buta", "Watsa"]
          },
          {
            "name": "Sud-Kivu",
            "cities": ["Bukavu", "Uvira", "Kabare", "Kalehe", "Mwenga"]
          }
        ]
      },
        {
          "country": "Congo, Republic of the",
          "states": [
            {
              "name": "Bouenza",
              "cities": ["Nkayi", "Madingou", "Loudima", "Boko-Songho", "Mfouati"]
            },
            {
              "name": "Brazzaville",
              "cities": ["Brazzaville"]
            },
            {
              "name": "Cuvette",
              "cities": ["Owando", "Makoua", "Oyo", "Boundji", "Tchikapika"]
            },
            {
              "name": "Cuvette-Ouest",
              "cities": ["Ewo", "Kelle", "Mbomo", "Etoumbi", "Okoyo"]
            },
            {
              "name": "Kouilou",
              "cities": ["Pointe-Noire", "Loango", "Hinda", "Nkayi", "Madingo-Kayes"]
            },
            {
              "name": "Lekoumou",
              "cities": ["Sibiti", "Komono", "Zanaga", "Bambama", "Mayoko"]
            },
            {
              "name": "Likouala",
              "cities": ["Impfondo", "Epena", "Liranga", "Bétou", "Dongou"]
            },
            {
              "name": "Niari",
              "cities": ["Dolisie", "Mossendjo", "Mbinda", "Kibangou", "Loubomo"]
            },
            {
              "name": "Plateaux",
              "cities": ["Djambala", "Gamboma", "Lekana", "Abala", "Ngo"]
            },
            {
              "name": "Pool",
              "cities": ["Kinkala", "Mindouli", "Boko", "Kindamba", "Vindza"]
            },
            {
              "name": "Sangha",
              "cities": ["Ouésso", "Sembé", "Souanké", "Mokéko", "Pikounda"]
            }
          ]
        },
        {
          "country": "Costa Rica",
          "states": [
            {
              "name": "Alajuela",
              "cities": ["Alajuela", "San José de Alajuela", "San Ramón", "Grecia", "Naranjo"]
            },
            {
              "name": "Cartago",
              "cities": ["Cartago", "Paraíso", "Turrialba", "La Unión", "El Guarco"]
            },
            {
              "name": "Guanacaste",
              "cities": ["Liberia", "Nicoya", "Santa Cruz", "Cañas", "Bagaces"]
            },
            {
              "name": "Heredia",
              "cities": ["Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael"]
            },
            {
              "name": "Limon",
              "cities": ["Limón", "Siquirres", "Guápiles", "Pococí", "Talamanca"]
            },
            {
              "name": "Puntarenas",
              "cities": ["Puntarenas", "Esparza", "Quepos", "Golfito", "Parrita"]
            },
            {
              "name": "San Jose",
              "cities": ["San José", "Escazú", "Desamparados", "Curridabat", "Alajuelita"]
            }
          ]
        },
        {
          "country": "Cote d'Ivoire",
          "states": []
        },
        {
          "country": "Croatia",
          "states": [
            {
              "name": "Bjelovarsko-Bilogorska",
              "cities": ["Bjelovar", "Daruvar", "Čazma", "Garešnica", "Grubišno Polje"]
            },
            {
              "name": "Brodsko-Posavska",
              "cities": ["Slavonski Brod", "Nova Gradiška", "Okučani", "Oriovac", "Vrpolje"]
            },
            {
              "name": "Dubrovacko-Neretvanska",
              "cities": ["Dubrovnik", "Metković", "Ploče", "Korčula", "Opuzen"]
            },
            {
              "name": "Istarska",
              "cities": ["Pula", "Rovinj", "Poreč", "Umag", "Pazin"]
            },
            {
              "name": "Karlovacka",
              "cities": ["Karlovac", "Ogulin", "Duga Resa", "Ozalj", "Slunj"]
            },
            {
              "name": "Koprivnicko-Krizevacka",
              "cities": ["Koprivnica", "Križevci", "Đurđevac", "Virje", "Novigrad Podravski"]
            },
            {
              "name": "Krapinsko-Zagorska",
              "cities": ["Krapina", "Zabok", "Oroslavje", "Donja Stubica", "Zlatar"]
            },
            {
              "name": "Licko-Senjska",
              "cities": ["Gospić", "Senj", "Otočac", "Novalja", "Korenica"]
            },
            {
              "name": "Medimurska",
              "cities": ["Čakovec", "Prelog", "Mursko Središće", "Nedelišće", "Kotoriba"]
            },
            {
              "name": "Osjecko-Baranjska",
              "cities": ["Osijek", "Đakovo", "Belišće", "Valpovo", "Našice"]
            },
            {
              "name": "Pozesko-Slavonska",
              "cities": ["Požega", "Pakrac", "Lipik", "Pleternica", "Kutjevo"]
            },
            {
              "name": "Primorsko-Goranska",
              "cities": ["Rijeka", "Opatija", "Krk", "Crikvenica", "Mali Lošinj"]
            },
            {
              "name": "Sibensko-Kninska",
              "cities": ["Šibenik", "Knin", "Vodice", "Drniš", "Skradin"]
            },
            {
              "name": "Sisacko-Moslavacka",
              "cities": ["Sisak", "Petrinja", "Kutina", "Novska", "Glina"]
            },
            {
              "name": "Splitsko-Dalmatinska",
              "cities": ["Split", "Kaštela", "Sinj", "Omiš", "Makarska"]
            },
            {
              "name": "Varazdinska",
              "cities": ["Varaždin", "Ivanec", "Novi Marof", "Ludbreg", "Lepoglava"]
            },
            {
              "name": "Viroviticko-Podravska",
              "cities": ["Virovitica", "Slatina", "Orahovica", "Pitomača", "Špišić Bukovica"]
            },
            {
              "name": "Vukovarsko-Srijemska",
              "cities": ["Vukovar", "Vinkovci", "Županja", "Ilok", "Otok"]
            },
            {
              "name": "Zadarska",
              "cities": ["Zadar", "Biograd na Moru", "Benkovac", "Pag", "Nin"]
            },
            {
              "name": "Zagreb",
              "cities": ["Zagreb", "Sesvete", "Lučko", "Hrvatski Leskovac", "Botinec"]
            },
            {
              "name": "Zagrebacka",
              "cities": ["Velika Gorica", "Samobor", "Zaprešić", "Dugo Selo", "Jastrebarsko"]
            }
          ]
        },
        {
          "country": "Cuba",
          "states": [
            {
              "name": "Camaguey",
              "cities": ["Camagüey", "Florida", "Nuevitas", "Guáimaro", "Santa Cruz del Sur"]
            },
            {
              "name": "Ciego de Avila",
              "cities": ["Ciego de Ávila", "Morón", "Venezuela", "Baraguá", "Bolivia"]
            },
            {
              "name": "Cienfuegos",
              "cities": ["Cienfuegos", "Rodas", "Palmira", "Cruces", "Lajas"]
            },
            {
              "name": "Ciudad de La Habana",
              "cities": ["Havana", "Playa", "Marianao", "Centro Habana", "Regla"]
            },
            {
              "name": "Granma",
              "cities": ["Bayamo", "Manzanillo", "Guisa", "Niquero", "Pilón"]
            },
            {
              "name": "Guantanamo",
              "cities": ["Guantánamo", "Baracoa", "Caimanera", "Yateras", "El Salvador"]
            },
            {
              "name": "Holguin",
              "cities": ["Holguín", "Banes", "Moa", "Mayarí", "Gibara"]
            },
            {
              "name": "Isla de la Juventud",
              "cities": ["Nueva Gerona", "Santa Fe", "La Demajagua", "La Fe", "Ciro Redondo"]
            },
            {
              "name": "La Habana",
              "cities": ["Artemisa", "San José de las Lajas", "Güines", "Bauta", "Jaruco"]
            },
            {
              "name": "Las Tunas",
              "cities": ["Las Tunas", "Puerto Padre", "Jobabo", "Manatí", "Colombia"]
            },
            {
              "name": "Matanzas",
              "cities": ["Matanzas", "Cárdenas", "Jovellanos", "Colón", "Varadero"]
            },
            {
              "name": "Pinar del Rio",
              "cities": ["Pinar del Río", "Viñales", "Sandino", "La Palma", "Consolación del Sur"]
            },
            {
              "name": "Sancti Spiritus",
              "cities": ["Sancti Spíritus", "Trinidad", "Cabaiguán", "Yaguajay", "Fomento"]
            },
            {
              "name": "Santiago de Cuba",
              "cities": ["Santiago de Cuba", "Palma Soriano", "San Luis", "Contramaestre", "Songo-La Maya"]
            },
            {
              "name": "Villa Clara",
              "cities": ["Santa Clara", "Sagua la Grande", "Placetas", "Remedios", "Caibarién"]
            }
          ]
        },
        {
          "country": "Cyprus",
          "states": [
            {
              "name": "Famagusta",
              "cities": ["Famagusta", "Paralimni", "Ayia Napa", "Deryneia", "Frenaros"]
            },
            {
              "name": "Kyrenia",
              "cities": ["Kyrenia", "Karavas", "Lapithos", "Agios Amvrosios", "Bellapais"]
            },
            {
              "name": "Larnaca",
              "cities": ["Larnaca", "Aradippou", "Athienou", "Lefkara", "Dromolaxia"]
            },
            {
              "name": "Limassol",
              "cities": ["Limassol", "Mesa Geitonia", "Agios Athanasios", "Germasogeia", "Ypsonas"]
            },
            {
              "name": "Nicosia",
              "cities": ["Nicosia", "Strovolos", "Lakatamia", "Aglangia", "Latsia"]
            },
            {
              "name": "Paphos",
              "cities": ["Paphos", "Geroskipou", "Peyia", "Polis", "Chlorakas"]
            }
          ]
        },
        {
          "country": "Czech Republic",
          "states": [
            {
              "name": "Jihocesky Kraj",
              "cities": ["České Budějovice", "Tábor", "Písek", "Strakonice", "Jindřichův Hradec"]
            },
            {
              "name": "Jihomoravsky Kraj",
              "cities": ["Brno", "Znojmo", "Hodonín", "Břeclav", "Vyškov"]
            },
            {
              "name": "Karlovarsky Kraj",
              "cities": ["Karlovy Vary", "Cheb", "Sokolov", "Ostrov", "Chodov"]
            },
            {
              "name": "Kralovehradecky Kraj",
              "cities": ["Hradec Králové", "Trutnov", "Náchod", "Jičín", "Dvůr Králové nad Labem"]
            },
            {
              "name": "Liberecky Kraj",
              "cities": ["Liberec", "Jablonec nad Nisou", "Česká Lípa", "Turnov", "Semily"]
            },
            {
              "name": "Moravskoslezsky Kraj",
              "cities": ["Ostrava", "Havířov", "Karviná", "Frýdek-Místek", "Opava"]
            },
            {
              "name": "Olomoucky Kraj",
              "cities": ["Olomouc", "Prostějov", "Přerov", "Šumperk", "Hranice"]
            },
            {
              "name": "Pardubicky Kraj",
              "cities": ["Pardubice", "Chrudim", "Svitavy", "Ústí nad Orlicí", "Česká Třebová"]
            },
            {
              "name": "Plzensky Kraj",
              "cities": ["Plzeň", "Klatovy", "Rokycany", "Tachov", "Domažlice"]
            },
            {
              "name": "Praha",
              "cities": ["Prague 1", "Prague 2", "Prague 3", "Prague 4", "Prague 5"]
            },
            {
              "name": "Stredocesky Kraj",
              "cities": ["Kladno", "Mladá Boleslav", "Příbram", "Kolín", "Kutná Hora"]
            },
            {
              "name": "Ustecky Kraj",
              "cities": ["Ústí nad Labem", "Most", "Teplice", "Chomutov", "Děčín"]
            },
            {
              "name": "Vysocina",
              "cities": ["Jihlava", "Třebíč", "Havlíčkův Brod", "Žďár nad Sázavou", "Pelhřimov"]
            },
            {
              "name": "Zlinsky Kraj",
              "cities": ["Zlín", "Kroměříž", "Uherské Hradiště", "Vsetín", "Valašské Meziříčí"]
            }
          ]
        },
        {
          "country": "Denmark",
          "states": [
            {
              "name": "Arhus",
              "cities": ["Århus", "Randers", "Silkeborg", "Skanderborg", "Ebeltoft"]
            },
            {
              "name": "Bornholm",
              "cities": ["Rønne", "Nexø", "Aakirkeby", "Allinge-Sandvig", "Hasle"]
            },
            {
              "name": "Frederiksberg",
              "cities": ["Frederiksberg"]
            },
            {
              "name": "Frederiksborg",
              "cities": ["Hillerød", "Helsingør", "Frederikssund", "Farum", "Birkerød"]
            },
            {
              "name": "Fyn",
              "cities": ["Odense", "Svendborg", "Nyborg", "Middelfart", "Faaborg"]
            },
            {
              "name": "Kobenhavn",
              "cities": ["Copenhagen", "Frederiksberg", "Gentofte", "Gladsaxe", "Hvidovre"]
            },
            {
              "name": "Kobenhavns",
              "cities": ["Ballerup", "Tårnby", "Dragør", "Albertslund", "Herlev"]
            },
            {
              "name": "Nordjylland",
              "cities": ["Aalborg", "Hjørring", "Frederikshavn", "Brønderslev", "Thisted"]
            },
            {
              "name": "Ribe",
              "cities": ["Esbjerg", "Varde", "Ribe", "Vejen", "Bramming"]
            },
            {
              "name": "Ringkobing",
              "cities": ["Herning", "Holstebro", "Ringkøbing", "Ikast", "Skjern"]
            },
            {
              "name": "Roskilde",
              "cities": ["Roskilde", "Køge", "Greve", "Solrød", "Lejre"]
            },
            {
              "name": "Sonderjylland",
              "cities": ["Sønderborg", "Aabenraa", "Haderslev", "Tønder", "Nordborg"]
            },
            {
              "name": "Storstrom",
              "cities": ["Næstved", "Nykøbing Falster", "Vordingborg", "Maribo", "Nakskov"]
            },
            {
              "name": "Vejle",
              "cities": ["Vejle", "Fredericia", "Kolding", "Horsens", "Billund"]
            },
            {
              "name": "Vestsjalland",
              "cities": ["Slagelse", "Kalundborg", "Korsør", "Ringsted", "Sorø"]
            },
            {
              "name": "Viborg",
              "cities": ["Viborg", "Skive", "Kjellerup", "Karup", "Møldrup"]
            }
          ]
        },
        {
          "country": "Djibouti",
          "states": [
            {
              "name": "Ali Sabih",
              "cities": ["Ali Sabieh", "Ali Adde", "Holhol", "As Ela", "Dewele"]
            },
            {
              "name": "Dikhil",
              "cities": ["Dikhil", "Yoboki", "Gobaad", "As Eyla", "Galafi"]
            },
            {
              "name": "Djibouti",
              "cities": ["Djibouti City", "Arta", "Damerjog", "Doraleh", "Balbala"]
            },
            {
              "name": "Obock",
              "cities": ["Obock", "Khor Angar", "Dadahalou", "Alaili Dadda", "Bissidiro"]
            },
            {
              "name": "Tadjoura",
              "cities": ["Tadjoura", "Randa", "Dorra", "Balho", "Sagallou"]
            }
          ]
        },
        {
          "country": "Dominica",
          "states": [
            {
              "name": "Saint Andrew",
              "cities": ["Marigot", "Wesley", "Woodford Hill", "Calibishie", "Vieille Case"]
            },
            {
              "name": "Saint David",
              "cities": ["Castle Bruce", "Delices", "Petit Soufriere", "Good Hope", "Rosalie"]
            },
            {
              "name": "Saint George",
              "cities": ["Roseau", "Loubiere", "Fond Cole", "Goodwill", "Newtown"]
            },
            {
              "name": "Saint John",
              "cities": ["Portsmouth", "Picard", "Glanvillia", "Tanetane", "Clifton"]
            },
            {
              "name": "Saint Joseph",
              "cities": ["Saint Joseph", "Layou", "Mero", "Salisbury", "Coulibistrie"]
            },
            {
              "name": "Saint Luke",
              "cities": ["Pointe Michel", "Soufriere", "Scotts Head", "Galion", "Berekua"]
            },
            {
              "name": "Saint Mark",
              "cities": ["Colihaut", "Dublanc", "Bioche", "Belle Vue", "Pte Latanier"]
            },
            {
              "name": "Saint Patrick",
              "cities": ["Berekua", "La Plaine", "Delices", "Petite Savanne", "Bagatelle"]
            },
            {
              "name": "Saint Paul",
              "cities": ["Canefield", "Mahaut", "Massacre", "Cochrane", "Belfast"]
            },
            {
              "name": "Saint Peter",
              "cities": ["Colihaut", "Dublanc", "Bioche", "Cottage", "Fond St. Jean"]
            }
          ]
        },
          {
            "country": "Dominican Republic",
            "states": [
              {
                "name": "Azua",
                "cities": ["Azua de Compostela", "Padre Las Casas", "Peralta", "Sabana Yegua", "Tábara Arriba"]
              },
              {
                "name": "Baoruco",
                "cities": ["Neiba", "Galván", "Los Ríos", "Villa Jaragua", "El Palmar"]
              },
              {
                "name": "Barahona",
                "cities": ["Barahona", "Cabral", "Enriquillo", "Paraíso", "Polo"]
              },
              {
                "name": "Dajabón",
                "cities": ["Dajabón", "Loma de Cabrera", "Partido", "Restauración", "El Pino"]
              },
              {
                "name": "Distrito Nacional",
                "cities": ["Santo Domingo"]
              },
              {
                "name": "Duarte",
                "cities": ["San Francisco de Macorís", "Arenoso", "Castillo", "Pimentel", "Villa Riva"]
              },
              {
                "name": "Elías Piña",
                "cities": ["Comendador", "Bánica", "El Llano", "Hondo Valle", "Pedro Santana"]
              },
              {
                "name": "El Seibo",
                "cities": ["Santa Cruz de El Seibo", "Miches", "Pedro Sánchez", "La Romana"]
              },
              {
                "name": "Espaillat",
                "cities": ["Moca", "Cayetano Germosén", "Gaspar Hernández", "Jamao al Norte", "San Víctor"]
              },
              {
                "name": "Hato Mayor",
                "cities": ["Hato Mayor del Rey", "Sabana de la Mar", "El Valle", "Guayabo Dulce", "Mata Palacio"]
              },
              {
                "name": "Independencia",
                "cities": ["Jimaní", "Cristóbal", "Duvergé", "La Descubierta", "Postrer Río"]
              },
              {
                "name": "La Altagracia",
                "cities": ["Salvaleón de Higüey", "San Rafael del Yuma", "La Otra Banda", "Verón", "Bávaro"]
              },
              {
                "name": "La Romana",
                "cities": ["La Romana", "Guaymate", "Villa Hermosa"]
              },
              {
                "name": "La Vega",
                "cities": ["Concepción de La Vega", "Constanza", "Jarabacoa", "Jima Abajo", "Rincón"]
              },
              {
                "name": "María Trinidad Sánchez",
                "cities": ["Nagua", "Cabrera", "El Factor", "Río San Juan", "Arroyo Salado"]
              },
              {
                "name": "Monseñor Nouel",
                "cities": ["Bonao", "Maimón", "Piedra Blanca", "Villa Sonador"]
              },
              {
                "name": "Monte Cristi",
                "cities": ["San Fernando de Monte Cristi", "Guayubín", "Las Matas de Santa Cruz", "Pepillo Salcedo", "Villa Vásquez"]
              },
              {
                "name": "Monte Plata",
                "cities": ["Monte Plata", "Bayaguana", "Peralvillo", "Sabana Grande de Boyá", "Yamasá"]
              },
              {
                "name": "Pedernales",
                "cities": ["Pedernales", "Oviedo", "Juancho", "José Francisco Peña Gómez"]
              },
              {
                "name": "Peravia",
                "cities": ["Baní", "Nizao", "Pizarrete", "Matanzas", "Sabana Buey"]
              },
              {
                "name": "Puerto Plata",
                "cities": ["San Felipe de Puerto Plata", "Sosúa", "Imbert", "Los Hidalgos", "Villa Isabela"]
              },
              {
                "name": "Salcedo",
                "cities": ["Salcedo", "Tenares", "Villa Tapia", "Jamao al Norte"]
              },
              {
                "name": "Samaná",
                "cities": ["Santa Bárbara de Samaná", "Las Terrenas", "Sánchez", "El Limón", "Arroyo Barril"]
              },
              {
                "name": "Sánchez Ramírez",
                "cities": ["Cotuí", "Fantino", "La Mata", "Cevicos", "Angelina"]
              },
              {
                "name": "San Cristóbal",
                "cities": ["San Cristóbal", "Bajos de Haina", "Villa Altagracia", "Cambita Garabitos", "Yaguate"]
              },
              {
                "name": "San José de Ocoa",
                "cities": ["San José de Ocoa", "Sabana Larga", "Rancho Arriba", "La Ciénaga", "El Naranjal"]
              },
              {
                "name": "San Juan",
                "cities": ["San Juan de la Maguana", "Bohechío", "El Cercado", "Juan de Herrera", "Las Matas de Farfán"]
              },
              {
                "name": "San Pedro de Macorís",
                "cities": ["San Pedro de Macorís", "Los Llanos", "Quisqueya", "Ramón Santana", "Consuelo"]
              },
              {
                "name": "Santiago",
                "cities": ["Santiago de los Caballeros", "Tamboril", "Villa González", "Licey al Medio", "San José de las Matas"]
              },
              {
                "name": "Santiago Rodríguez",
                "cities": ["San Ignacio de Sabaneta", "Monción", "Villa Los Almácigos"]
              },
              {
                "name": "Santo Domingo",
                "cities": ["Santo Domingo Este", "Santo Domingo Norte", "Santo Domingo Oeste", "Los Alcarrizos", "Pedro Brand"]
              },
              {
                "name": "Valverde",
                "cities": ["Mao", "Esperanza", "Laguna Salada", "Cana Chapetón", "Maizal"]
              }
            ]
          },
          {
            "country": "East Timor",
            "states": [
              {
                "name": "Aileu",
                "cities": ["Aileu", "Remexio", "Laulara", "Liquidoe"]
              },
              {
                "name": "Ainaro",
                "cities": ["Ainaro", "Hato-Udo", "Maubisse", "Hatulia"]
              },
              {
                "name": "Baucau",
                "cities": ["Baucau", "Venilale", "Laga", "Quelicai", "Vemasse"]
              },
              {
                "name": "Bobonaro",
                "cities": ["Maliana", "Bobonaro", "Lolotoe", "Atabae", "Balibo"]
              },
              {
                "name": "Cova-Lima",
                "cities": ["Suai", "Tilomar", "Fohorem", "Fatululic", "Zumalai"]
              },
              {
                "name": "Dili",
                "cities": ["Dili", "Metinaro", "Cristo Rei", "Dom Aleixo", "Vera Cruz"]
              },
              {
                "name": "Ermera",
                "cities": ["Gleno", "Ermera", "Letefoho", "Railaco", "Atsabe"]
              },
              {
                "name": "Lautem",
                "cities": ["Lospalos", "Iliomar", "Luro", "Tutuala", "Lautem"]
              },
              {
                "name": "Liquiçá",
                "cities": ["Liquiçá", "Bazartete", "Maubara", "Vatuboro", "Lauhata"]
              },
              {
                "name": "Manatuto",
                "cities": ["Manatuto", "Laclubar", "Lacluta", "Barique", "Soibada"]
              },
              {
                "name": "Manufahi",
                "cities": ["Same", "Alas", "Fatuberliu", "Turiscai", "Betano"]
              },
              {
                "name": "Oecussi",
                "cities": ["Pante Macassar", "Oesilo", "Nitibe", "Passabe", "Citrana"]
              },
              {
                "name": "Viqueque",
                "cities": ["Viqueque", "Uato-Lari", "Uatucarbau", "Ossu", "Lacluta"]
              }
            ]
          },
          {
            "country": "Ecuador",
            "states": [
              {
                "name": "Azuay",
                "cities": ["Cuenca", "Gualaceo", "Paute", "Sigsig", "Chordeleg"]
              },
              {
                "name": "Bolívar",
                "cities": ["Guaranda", "San Miguel", "Chillanes", "Caluma", "Echeandía"]
              },
              {
                "name": "Cañar",
                "cities": ["Azogues", "Biblián", "Cañar", "La Troncal", "Déleg"]
              },
              {
                "name": "Carchi",
                "cities": ["Tulcán", "Mira", "El Ángel", "Huaca", "San Gabriel"]
              },
              {
                "name": "Chimborazo",
                "cities": ["Riobamba", "Guano", "Alausí", "Chambo", "Colta"]
              },
              {
                "name": "Cotopaxi",
                "cities": ["Latacunga", "Saquisilí", "Pujilí", "Salcedo", "La Maná"]
              },
              {
                "name": "El Oro",
                "cities": ["Machala", "Pasaje", "Santa Rosa", "Huaquillas", "Arenillas"]
              },
              {
                "name": "Esmeraldas",
                "cities": ["Esmeraldas", "Atacames", "Muisne", "Quinindé", "San Lorenzo"]
              },
              {
                "name": "Galápagos",
                "cities": ["Puerto Baquerizo Moreno", "Puerto Ayora", "Puerto Villamil", "Santa Cruz", "San Cristóbal"]
              },
              {
                "name": "Guayas",
                "cities": ["Guayaquil", "Durán", "Samborondón", "Daule", "Milagro"]
              },
              {
                "name": "Imbabura",
                "cities": ["Ibarra", "Otavalo", "Cotacachi", "Atuntaqui", "Pimampiro"]
              },
              {
                "name": "Loja",
                "cities": ["Loja", "Catamayo", "Zapotillo", "Cariamanga", "Macará"]
              },
              {
                "name": "Los Ríos",
                "cities": ["Babahoyo", "Quevedo", "Ventanas", "Vinces", "Palenque"]
              },
              {
                "name": "Manabí",
                "cities": ["Portoviejo", "Manta", "Chone", "Jipijapa", "Bahía de Caráquez"]
              },
              {
                "name": "Morona-Santiago",
                "cities": ["Macas", "Gualaquiza", "Sucúa", "Limón Indanza", "Palora"]
              },
              {
                "name": "Napo",
                "cities": ["Tena", "Archidona", "El Chaco", "Carlos Julio Arosemena Tola", "Quijos"]
              },
              {
                "name": "Orellana",
                "cities": ["Puerto Francisco de Orellana", "La Joya de los Sachas", "Loreto", "Aguarico", "Tiputini"]
              },
              {
                "name": "Pastaza",
                "cities": ["Puyo", "Mera", "Santa Clara", "Arajuno", "Shell"]
              },
              {
                "name": "Pichincha",
                "cities": ["Quito", "Sangolquí", "Cayambe", "Machachi", "Pedro Moncayo"]
              },
              {
                "name": "Sucumbíos",
                "cities": ["Nueva Loja", "Shushufindi", "Lago Agrio", "Cascales", "Cuyabeno"]
              },
              {
                "name": "Tungurahua",
                "cities": ["Ambato", "Baños", "Pelileo", "Píllaro", "Quero"]
              },
              {
                "name": "Zamora-Chinchipe",
                "cities": ["Zamora", "Yantzaza", "Zumbi", "Palanda", "Centinela del Cóndor"]
              }
            ]
          }
        ,
        {
          "country": "Egypt",
          "states": [
            {
              "name": "Ad Daqahliyah",
              "cities": ["Mansoura", "Mit Ghamr", "Talkha", "El Mahalla El Kubra"]
            },
            {
              "name": "Al Bahr al Ahmar",
              "cities": ["Hurghada", "Safaga", "Quseir"]
            },
            {
              "name": "Al Buhayrah",
              "cities": ["Damanhur", "Kafr ad-Dawwar", "Rashid"]
            },
            {
              "name": "Al Fayyum",
              "cities": ["Fayoum", "Ibshaway", "Senuris"]
            },
            {
              "name": "Al Gharbiyah",
              "cities": ["Tanta", "Zifta", "Mahalla"]
            },
            {
              "name": "Al Iskandariyah",
              "cities": ["Alexandria", "Damanhour", "Kafr El Dawar"]
            },
            {
              "name": "Al Isma'iliyah",
              "cities": ["Ismailia", "Fayed", "Qantara"]
            },
            {
              "name": "Al Jizah",
              "cities": ["Giza", "6th of October", "El-Hawamdiyah"]
            },
            {
              "name": "Al Minufiyah",
              "cities": ["Shibin El Kom", "Minuf", "Ashmoun"]
            },
            {
              "name": "Al Minya",
              "cities": ["Minya", "Mallawi", "Beni Mazar"]
            },
            {
              "name": "Al Qahirah",
              "cities": ["Cairo"]
            },
            {
              "name": "Al Qalyubiyah",
              "cities": ["Benha", "Shubra El Kheima", "Qalyub"]
            },
            {
              "name": "Al Wadi al Jadid",
              "cities": ["Kharga", "Dakhla", "Farafra"]
            },
            {
              "name": "Ash Sharqiyah",
              "cities": ["Zagazig", "Faqous", "Belbes"]
            },
            {
              "name": "As Suways",
              "cities": ["Suez"]
            },
            {
              "name": "Aswan",
              "cities": ["Aswan", "Nubian Village", "Edfu"]
            },
            {
              "name": "Asyut",
              "cities": ["Asyut", "Manfalut", "Abnub"]
            },
            {
              "name": "Bani Suwayf",
              "cities": ["Beni Suef", "Fashn", "Nasser"]
            },
            {
              "name": "Bur Sa'id",
              "cities": ["Port Said"]
            },
            {
              "name": "Dumyat",
              "cities": ["Damietta"]
            },
            {
              "name": "Janub Sina'",
              "cities": ["Sharm El Sheikh", "Ras Sudr", "Taba"]
            },
            {
              "name": "Kafr ash Shaykh",
              "cities": ["Kafr El Sheikh", "Desouk", "Riyad"]
            },
            {
              "name": "Matruh",
              "cities": ["Marsa Matruh", "Alamein"]
            },
            {
              "name": "Qina",
              "cities": ["Qena", "Nag Hammadi", "Dandarah"]
            },
            {
              "name": "Shamal Sina'",
              "cities": ["El Arish", "Rafah", "Taba"]
            },
            {
              "name": "Suhaj",
              "cities": ["Sohag", "Gerga", "Tahta"]
            }
          ]
        },
        {
          "country": "El Salvador",
          "states": [
            {
              "name": "Ahuachapan",
              "cities": ["Ahuachapan", "Conchagua", "San Lorenzo"]
            },
            {
              "name": "Cabanas",
              "cities": ["Sensuntepeque", "Ilobasco", "Cabanas"]
            },
            {
              "name": "Chalatenango",
              "cities": ["Chalatenango", "San Ignacio", "La Palma"]
            },
            {
              "name": "Cuscatlan",
              "cities": ["Cojutepeque", "San Pedro Perulapan", "San Rafael Cedros"]
            },
            {
              "name": "La Libertad",
              "cities": ["La Libertad", "Comasagua", "Tamanique"]
            },
            {
              "name": "La Paz",
              "cities": ["Zaragoza", "San Pedro Masahuat", "San Juan Tepezontes"]
            },
            {
              "name": "La Union",
              "cities": ["La Union", "Puerto El Triunfo", "Conchagua"]
            },
            {
              "name": "Morazan",
              "cities": ["San Esteban Catarina", "Jocoro", "Perquin"]
            },
            {
              "name": "San Miguel",
              "cities": ["San Miguel", "Chirilagua", "Nueva Guadalupe"]
            },
            {
              "name": "San Salvador",
              "cities": ["San Salvador"]
            },
            {
              "name": "Santa Ana",
              "cities": ["Santa Ana", "Metapan", "Coatepeque"]
            },
            {
              "name": "San Vicente",
              "cities": ["San Vicente", "Tecoluca", "Santo Tomas"]
            },
            {
              "name": "Sonsonate",
              "cities": ["Sonsonate", "Juayua", "Izalco"]
            },
            {
              "name": "Usulutan",
              "cities": ["Usulutan", "El Triunfo", "Jiquilisco"]
            }
          ]
        },
        {
          "country": "Equatorial Guinea",
          "states": [
            {
              "name": "Annobon",
              "cities": ["San Antonio de Palé"]
            },
            {
              "name": "Bioko Norte",
              "cities": ["Malabo", "Luba", "Bata"]
            },
            {
              "name": "Bioko Sur",
              "cities": ["Ebebiyin", "Cogo"]
            },
            {
              "name": "Centro Sur",
              "cities": ["Evinayong"]
            },
            {
              "name": "Kie-Ntem",
              "cities": ["Mongomo", "Aconibe"]
            },
            {
              "name": "Litoral",
              "cities": ["Bata"]
            },
            {
              "name": "Wele-Nzas",
              "cities": ["Aguabón", "Nsok-Nsom"]
            }
          ]
        },
        {
          "country": "Eritrea",
          "states": [
            {
              "name": "Anseba",
              "cities": ["Keren", "Hagaz", "Elabered", "Hamelmalo", "Adi Tekelezan"]
            },
            {
              "name": "Debub",
              "cities": ["Mendefera", "Dekemhare", "Adi Quala", "Senafe", "Areza"]
            },
            {
              "name": "Debubawi K'eyih Bahri",
              "cities": ["Assab", "Beylul", "Rahayta", "Edi", "Ti'o"]
            },
            {
              "name": "Gash Barka",
              "cities": ["Barentu", "Agordat", "Tesseney", "Molki", "Shambuko"]
            },
            {
              "name": "Ma'akel",
              "cities": ["Asmara", "Serejeka", "Tsazega", "Adi Guadad", "Embeyto"]
            },
            {
              "name": "Semenawi Keyih Bahri",
              "cities": ["Massawa", "Nakfa", "Karora", "Afabet", "Dahlak"]
            }
          ]
        },
        {
          "country": "Estonia",
          "states": [
            {
              "name": "Harjumaa (Tallinn)",
              "cities": ["Tallinn", "Maardu", "Keila", "Saue", "Paldiski"]
            },
            {
              "name": "Hiiumaa (Kardla)",
              "cities": ["Kärdla", "Käina", "Kõrgessaare", "Emmaste", "Pühalepa"]
            },
            {
              "name": "Ida-Virumaa (Johvi)",
              "cities": ["Narva", "Kohtla-Järve", "Jõhvi", "Sillamäe", "Kiviõli"]
            },
            {
              "name": "Jarvamaa (Paide)",
              "cities": ["Paide", "Türi", "Järva-Jaani", "Koeru", "Ambla"]
            },
            {
              "name": "Jogevamaa (Jogeva)",
              "cities": ["Jõgeva", "Põltsamaa", "Mustvee", "Palamuse", "Torma"]
            },
            {
              "name": "Laanemaa (Haapsalu)",
              "cities": ["Haapsalu", "Lihula", "Taebla", "Virtsu", "Risti"]
            },
            {
              "name": "Laane-Virumaa (Rakvere)",
              "cities": ["Rakvere", "Tapa", "Kunda", "Tamsalu", "Väike-Maarja"]
            },
            {
              "name": "Parnumaa (Parnu)",
              "cities": ["Pärnu", "Sindi", "Kilingi-Nõmme", "Vändra", "Paikuse"]
            },
            {
              "name": "Polvamaa (Polva)",
              "cities": ["Põlva", "Räpina", "Värska", "Ahja", "Kanepi"]
            },
            {
              "name": "Raplamaa (Rapla)",
              "cities": ["Rapla", "Märjamaa", "Kohila", "Järvakandi", "Kehtna"]
            },
            {
              "name": "Saaremaa (Kuressaare)",
              "cities": ["Kuressaare", "Orissaare", "Leisi", "Kihelkonna", "Salme"]
            },
            {
              "name": "Tartumaa (Tartu)",
              "cities": ["Tartu", "Elva", "Kallaste", "Nõo", "Ülenurme"]
            },
            {
              "name": "Valgamaa (Valga)",
              "cities": ["Valga", "Tõrva", "Otepää", "Puka", "Sangaste"]
            },
            {
              "name": "Viljandimaa (Viljandi)",
              "cities": ["Viljandi", "Võhma", "Mõisaküla", "Abja-Paluoja", "Suure-Jaani"]
            },
            {
              "name": "Vorumaa (Voru)",
              "cities": ["Võru", "Antsla", "Rõuge", "Vastseliina", "Meremäe"]
            }
          ]
        },
        {
          "country": "Ethiopia",
          "states": [
            {
              "name": "Addis Ababa",
              "cities": ["Addis Ababa", "Bole", "Yeka", "Kirkos", "Arada"]
            },
            {
              "name": "Afar",
              "cities": ["Semera", "Dubti", "Assaita", "Awash", "Gewane"]
            },
            {
              "name": "Amhara",
              "cities": ["Bahir Dar", "Gondar", "Dessie", "Debre Markos", "Debre Birhan"]
            },
            {
              "name": "Binshangul Gumuz",
              "cities": ["Asosa", "Bambasi", "Mao-Komo", "Kamashi", "Metekel"]
            },
            {
              "name": "Dire Dawa",
              "cities": ["Dire Dawa", "Melka Jebdu", "Genda Kore", "Legahare", "Addis Ketema"]
            },
            {
              "name": "Gambela Hizboch",
              "cities": ["Gambela", "Abobo", "Itang", "Jikawo", "Godere"]
            },
            {
              "name": "Harari",
              "cities": ["Harar", "Dire Teyara", "Sofi", "Erer", "Hakim"]
            },
            {
              "name": "Oromia",
              "cities": ["Adama", "Jimma", "Nekemte", "Bishoftu", "Shashamane"]
            },
            {
              "name": "Somali",
              "cities": ["Jijiga", "Gode", "Degehabur", "Kebri Dahar", "Werder"]
            },
            {
              "name": "Tigray",
              "cities": ["Mekelle", "Adigrat", "Axum", "Adwa", "Shire"]
            },
            {
              "name": "Southern Nations, Nationalities, and Peoples Region",
              "cities": ["Hawassa", "Sodo", "Arba Minch", "Dilla", "Hosaena"]
            }
          ]
        },
        {
          "country": "Fiji",
          "states": [
            {
              "name": "Central (Suva)",
              "cities": ["Suva", "Nausori", "Navua", "Korovou", "Pacific Harbour"]
            },
            {
              "name": "Eastern (Levuka)",
              "cities": ["Levuka", "Lomaloma", "Lakeba", "Vunisea", "Moala"]
            },
            {
              "name": "Northern (Labasa)",
              "cities": ["Labasa", "Savusavu", "Seaqaqa", "Taveuni", "Nabouwalu"]
            },
            {
              "name": "Rotuma",
              "cities": ["Ahau", "Oinafa", "Pepjei", "Itu'ti'u", "Malhaha"]
            },
            {
              "name": "Western (Lautoka)",
              "cities": ["Lautoka", "Nadi", "Ba", "Sigatoka", "Tavua"]
            }
          ]
        },

        {
          "country": "Finland",
          "states": [
            {
              "name": "Aland",
              "cities": ["Mariehamn", "Jomala", "Finström", "Lemland", "Saltvik"]
            },
            {
              "name": "Etela-Suomen Laani",
              "cities": ["Helsinki", "Espoo", "Vantaa", "Lahti", "Tampere"]
            },
            {
              "name": "Ita-Suomen Laani",
              "cities": ["Kuopio", "Joensuu", "Mikkeli", "Savonlinna", "Lappeenranta"]
            },
            {
              "name": "Lansi-Suomen Laani",
              "cities": ["Turku", "Oulu", "Pori", "Jyväskylä", "Vaasa"]
            },
            {
              "name": "Lappi",
              "cities": ["Rovaniemi", "Kemi", "Tornio", "Sodankylä", "Kemijärvi"]
            },
            {
              "name": "Oulun Laani",
              "cities": ["Oulu", "Kajaani", "Raahe", "Ylivieska", "Kuusamo"]
            }
          ]
        },
        {
          "country": "France",
          "states": [
            {
              "name": "Alsace",
              "cities": ["Strasbourg", "Mulhouse", "Colmar", "Haguenau", "Schiltigheim"]
            },
            {
              "name": "Aquitaine",
              "cities": ["Bordeaux", "Pau", "Mérignac", "Pessac", "Bayonne"]
            },
            {
              "name": "Auvergne",
              "cities": ["Clermont-Ferrand", "Montluçon", "Aurillac", "Vichy", "Le Puy-en-Velay"]
            },
            {
              "name": "Basse-Normandie",
              "cities": ["Caen", "Cherbourg", "Alençon", "Lisieux", "Saint-Lô"]
            },
            {
              "name": "Bourgogne",
              "cities": ["Dijon", "Chalon-sur-Saône", "Nevers", "Auxerre", "Mâcon"]
            },
            {
              "name": "Bretagne",
              "cities": ["Rennes", "Brest", "Quimper", "Lorient", "Vannes"]
            },
            {
              "name": "Centre",
              "cities": ["Tours", "Orléans", "Bourges", "Blois", "Châteauroux"]
            },
            {
              "name": "Champagne-Ardenne",
              "cities": ["Reims", "Troyes", "Charleville-Mézières", "Châlons-en-Champagne", "Épernay"]
            },
            {
              "name": "Corse",
              "cities": ["Ajaccio", "Bastia", "Porto-Vecchio", "Corte", "Calvi"]
            },
            {
              "name": "Franche-Comte",
              "cities": ["Besançon", "Montbéliard", "Belfort", "Dole", "Lons-le-Saunier"]
            },
            {
              "name": "Haute-Normandie",
              "cities": ["Rouen", "Le Havre", "Évreux", "Dieppe", "Sotteville-lès-Rouen"]
            },
            {
              "name": "Ile-de-France",
              "cities": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Créteil"]
            },
            {
              "name": "Languedoc-Roussillon",
              "cities": ["Montpellier", "Nîmes", "Perpignan", "Béziers", "Carcassonne"]
            },
            {
              "name": "Limousin",
              "cities": ["Limoges", "Brive-la-Gaillarde", "Tulle", "Ussel", "Guéret"]
            },
            {
              "name": "Lorraine",
              "cities": ["Metz", "Nancy", "Thionville", "Épinal", "Vandœuvre-lès-Nancy"]
            },
            {
              "name": "Midi-Pyrenees",
              "cities": ["Toulouse", "Montauban", "Albi", "Tarbes", "Castres"]
            },
            {
              "name": "Nord-Pas-de-Calais",
              "cities": ["Lille", "Roubaix", "Tourcoing", "Dunkerque", "Calais"]
            },
            {
              "name": "Pays de la Loire",
              "cities": ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "Cholet"]
            },
            {
              "name": "Picardie",
              "cities": ["Amiens", "Beauvais", "Compiègne", "Laon", "Soissons"]
            },
            {
              "name": "Poitou-Charentes",
              "cities": ["Poitiers", "La Rochelle", "Niort", "Angoulême", "Châtellerault"]
            },
            {
              "name": "Provence-Alpes-Cote d'Azur",
              "cities": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"]
            },
            {
              "name": "Rhone-Alpes",
              "cities": ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Valence"]
            }
          ]
        },
        {
          "country": "Gabon",
          "states": [
            {
              "name": "Estuaire",
              "cities": ["Libreville", "Ntoum", "Kango", "Cocobeach", "Owendo"]
            },
            {
              "name": "Haut-Ogooué",
              "cities": ["Franceville", "Moanda", "Okondja", "Lékoni", "Mounana"]
            },
            {
              "name": "Moyen-Ogooué",
              "cities": ["Lambaréné", "Ndendé", "Fougamou", "Ndjolé", "Booué"]
            },
            {
              "name": "Ngounié",
              "cities": ["Mouila", "Ndendé", "Fougamou", "Mbigou", "Mimongo"]
            },
            {
              "name": "Nyanga",
              "cities": ["Tchibanga", "Mayumba", "Moabi", "Mabanda", "Ndindi"]
            },
            {
              "name": "Ogooué-Ivindo",
              "cities": ["Makokou", "Booué", "Ovan", "Mékambo", "Zadié"]
            },
            {
              "name": "Ogooué-Lolo",
              "cities": ["Koulamoutou", "Pana", "Lastoursville", "Mouila", "Lébamba"]
            },
            {
              "name": "Ogooué-Maritime",
              "cities": ["Port-Gentil", "Omboué", "Gamba", "Ndogo", "Sette Cama"]
            },
            {
              "name": "Woleu-Ntem",
              "cities": ["Oyem", "Bitam", "Mitzic", "Minvoul", "Medouneu"]
            }
          ]
        },
        {
          "country": "Gambia",
          "states": [
            {
              "name": "Banjul",
              "cities": ["Banjul", "Bakau", "Serrekunda", "Brikama", "Bakoteh"]
            },
            {
              "name": "Central River",
              "cities": ["Janjanbureh", "Bansang", "Kuntaur", "Soma", "Sare Ngai"]
            },
            {
              "name": "Lower River",
              "cities": ["Mansa Konko", "Soma", "Kerewan", "Farafenni", "Basse Santa Su"]
            },
            {
              "name": "North Bank",
              "cities": ["Kerewan", "Farafenni", "Barra", "Essau", "Kaur"]
            },
            {
              "name": "Upper River",
              "cities": ["Basse Santa Su", "Fatoto", "Demba Kunda", "Sutukoba", "Sotuma Sere"]
            },
            {
              "name": "Western",
              "cities": ["Brikama", "Serekunda", "Bakau", "Banjul", "Brufut"]
            }
          ]
        },
        {
          "country": "Georgia",
          "states": []
        },
        {
          "country": "Germany",
          "states": [
            {
              "name": "Baden-Wuerttemberg",
              "cities": ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg"]
            },
            {
              "name": "Bayern",
              "cities": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg"]
            },
            {
              "name": "Berlin",
              "cities": ["Berlin-Mitte", "Charlottenburg-Wilmersdorf", "Friedrichshain-Kreuzberg", "Neukölln", "Spandau"]
            },
            {
              "name": "Brandenburg",
              "cities": ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)", "Oranienburg"]
            },
            {
              "name": "Bremen",
              "cities": ["Bremen", "Bremerhaven", "Vegesack", "Blumenthal", "Gröpelingen"]
            },
            {
              "name": "Hamburg",
              "cities": ["Hamburg-Mitte", "Altona", "Eimsbüttel", "Hamburg-Nord", "Wandsbek"]
            },
            {
              "name": "Hessen",
              "cities": ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach"]
            },
            {
              "name": "Mecklenburg-Vorpommern",
              "cities": ["Rostock", "Schwerin", "Neubrandenburg", "Stralsund", "Greifswald"]
            },
            {
              "name": "Niedersachsen",
              "cities": ["Hannover", "Braunschweig", "Osnabrück", "Oldenburg", "Wolfsburg"]
            },
            {
              "name": "Nordrhein-Westfalen",
              "cities": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg"]
            },
            {
              "name": "Rheinland-Pfalz",
              "cities": ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern"]
            },
            {
              "name": "Saarland",
              "cities": ["Saarbrücken", "Neunkirchen", "Homburg", "Völklingen", "Merzig"]
            },
            {
              "name": "Sachsen",
              "cities": ["Dresden", "Leipzig", "Chemnitz", "Zwickau", "Plauen"]
            },
            {
              "name": "Sachsen-Anhalt",
              "cities": ["Magdeburg", "Halle", "Dessau-Roßlau", "Wittenberg", "Bitterfeld-Wolfen"]
            },
            {
              "name": "Schleswig-Holstein",
              "cities": ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt"]
            },
            {
              "name": "Thueringen",
              "cities": ["Erfurt", "Jena", "Gera", "Weimar", "Gotha"]
            }
          ]
        },
        {
          "country": "Ghana",
          "states": [
            {
              "name": "Ashanti",
              "cities": ["Kumasi", "Obuasi", "Mampong", "Konongo", "Ejura"]
            },
            {
              "name": "Brong-Ahafo",
              "cities": ["Sunyani", "Techiman", "Berekum", "Dormaa Ahenkro", "Kintampo"]
            },
            {
              "name": "Central",
              "cities": ["Cape Coast", "Winneba", "Kasoa", "Elmina", "Swedru"]
            },
            {
              "name": "Eastern",
              "cities": ["Koforidua", "Nkawkaw", "Nsawam", "Mpraeso", "Kibi"]
            },
            {
              "name": "Greater Accra",
              "cities": ["Accra", "Tema", "Madina", "Teshie", "La"]
            },
            {
              "name": "Northern",
              "cities": ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Gushiegu"]
            },
            {
              "name": "Upper East",
              "cities": ["Bolgatanga", "Navrongo", "Bawku", "Zebilla", "Paga"]
            },
            {
              "name": "Upper West",
              "cities": ["Wa", "Lawra", "Jirapa", "Nandom", "Tumu"]
            },
            {
              "name": "Volta",
              "cities": ["Ho", "Keta", "Hohoe", "Kpandu", "Aflao"]
            },
            {
              "name": "Western",
              "cities": ["Sekondi-Takoradi", "Tarkwa", "Axim", "Bibiani", "Half Assini"]
            }
          ]
        },
        {
          "country": "Greece",
          "states": [
            {
              "name": "Agion Oros",
              "cities": ["Karyes", "Dafni", "Ouranoupolis"]
            },
            {
              "name": "Achaia",
              "cities": ["Patras", "Aigio", "Kato Achaia", "Diakofto", "Rio"]
            },
            {
              "name": "Aitolia kai Akarmania",
              "cities": ["Agrinio", "Messolonghi", "Nafpaktos", "Amfilochia", "Vonitsa"]
            },
            {
              "name": "Attiki",
              "cities": ["Athens", "Piraeus", "Peristeri", "Kallithea", "Glyfada"]
            },
            {
              "name": "Thessaloniki",
              "cities": ["Thessaloniki", "Kalamaria", "Stavroupoli", "Neapoli", "Sykies"]
            },
            {
              "name": "Irakleion",
              "cities": ["Heraklion", "Chersonisos", "Malia", "Archanes", "Gazi"]
            }
          ]
        },
        {
          "country": "Greenland",
          "states": [
            {
              "name": "Avannaa (Nordgronland)",
              "cities": ["Qaanaaq", "Upernavik", "Uummannaq", "Ilulissat", "Qeqertarsuaq"]
            },
            {
              "name": "Tunu (Ostgronland)",
              "cities": ["Tasiilaq", "Ittoqqortoormiit", "Kulusuk", "Sermiligaaq", "Kuummiit"]
            },
            {
              "name": "Kitaa (Vestgronland)",
              "cities": ["Nuuk", "Sisimiut", "Maniitsoq", "Paamiut", "Qaqortoq"]
            }
          ]
        },
          {
            "country": "Grenada",
            "states": [
              {
                "name": "Carriacou and Petit Martinique",
                "cities": ["Carriacou", "Petit Martinique"]
              },
              {
                "name": "Saint Andrew",
                "cities": ["Grenville", "La Fillette", "Gouyave"]
              },
              {
                "name": "Saint David",
                "cities": ["Saint David", "Victoria", "Delices"]
              },
              {
                "name": "Saint George",
                "cities": ["St. George's", "Grand Anse", "Morne Jaloux"]
              },
              {
                "name": "Saint John",
                "cities": ["Gouyave", "Carenage", "Thebaide"]
              },
              {
                "name": "Saint Mark",
                "cities": ["Victoria", "Saint Mark", "Sauters"]
              },
              {
                "name": "Saint Patrick",
                "cities": ["Sauteurs", "River Sallee", "Paradise"]
              }
            ]
          },
          {
            "country": "Guatemala",
            "states": [
              {
                "name": "Alta Verapaz",
                "cities": ["Cobán", "Santa Cruz Verapaz", "San Cristobal Verapaz"]
              },
              {
                "name": "Baja Verapaz",
                "cities": ["Salamá", "Rabinal", "San Miguel Chicaj"]
              },
              {
                "name": "Chimaltenango",
                "cities": ["Chimaltenango", "San Martín Jilotepeque", "Pueblo Nuevo Viñas"]
              },
              {
                "name": "Chiquimula",
                "cities": ["Chiquimula", "Esquipulas", "San Juan Ermita"]
              },
              {
                "name": "El Progreso",
                "cities": ["El Progreso", "Sanarate", "Morazan"]
              },
              {
                "name": "Escuintla",
                "cities": ["Escuintla", "Santa Lucia Cotzumalguapa", "La Democracia"]
              },
              {
                "name": "Guatemala",
                "cities": ["Guatemala City", "Mixco", "Villa Nueva"]
              },
              {
                "name": "Huehuetenango",
                "cities": ["Huehuetenango", "Concepción Huista", "Santa Eulalia"]
              },
              {
                "name": "Izabal",
                "cities": ["Puerto Barrios", "Livingston", "El Estor"]
              },
              {
                "name": "Jalapa",
                "cities": ["Jalapa", "Mataquescuintla", "San Luis Jilotepeque"]
              },
              {
                "name": "Jutiapa",
                "cities": ["Jutiapa", "El Adelanto", "Santa Catarina Mita"]
              },
              {
                "name": "Peten",
                "cities": ["Flores", "Santa Elena", "San Benito"]
              },
              {
                "name": "Quetzaltenango",
                "cities": ["Quetzaltenango", "Coatepeque", "La Esperanza"]
              },
              {
                "name": "Quiche",
                "cities": ["Santa Cruz del Quiché", "Chichicastenango", "Patzún"]
              },
              {
                "name": "Retalhuleu",
                "cities": ["Retalhuleu", "San Sebastián", "San Andrés"]
              },
              {
                "name": "Sacatepequez",
                "cities": ["Antigua Guatemala", "San Lucas Sacatepequez", "Santa Lucia Milpas Altas"]
              },
              {
                "name": "San Marcos",
                "cities": ["San Marcos", "Catarina", "San Pedro Sacatepequez"]
              },
              {
                "name": "Santa Rosa",
                "cities": ["Cuilapa", "Barberena", "San Juan Tecuaco"]
              },
              {
                "name": "Solola",
                "cities": ["Solola", "San Lucas Tolimán", "San Jose Chacayá"]
              },
              {
                "name": "Suchitepequez",
                "cities": ["Mazatenango", "San Antonio Suchitepéquez", "Cuyotenango"]
              },
              {
                "name": "Totonicapan",
                "cities": ["Totonicapan", "San Bartolo", "San Antonio Sacatepequez"]
              },
              {
                "name": "Zacapa",
                "cities": ["Zacapa", "Estanzuela", "Rio Hondo"]
              }
            ]
          },
          {
            "country": "Guinea",
            "states": [
              {
                "name": "Beyla",
                "cities": ["Beyla", "Kountaya", "Sokourala"]
              },
              {
                "name": "Boffa",
                "cities": ["Boffa", "Bambeto", "Kakou"]
              },
              {
                "name": "Boke",
                "cities": ["Boke", "Kamsar", "Tita"]
              },
              {
                "name": "Conakry",
                "cities": ["Conakry", "Ratoma", "Kaloum"]
              },
              {
                "name": "Coyah",
                "cities": ["Coyah", "Sanankoro", "Albadaria"]
              },
              {
                "name": "Dabola",
                "cities": ["Dabola", "Konindou", "Siguiri"]
              },
              {
                "name": "Dalaba",
                "cities": ["Dalaba", "Bantantan", "Dara"]
              },
              {
                "name": "Dinguiraye",
                "cities": ["Dinguiraye", "Kissidougou", "Koundara"]
              },
              {
                "name": "Dubreka",
                "cities": ["Dubreka", "Boké", "Bara"]
              },
              {
                "name": "Faranah",
                "cities": ["Faranah", "Koropo", "Boké"]
              },
              {
                "name": "Forecariah",
                "cities": ["Forecariah", "Boké", "Siguiri"]
              },
              {
                "name": "Fria",
                "cities": ["Fria", "Matoto", "Labé"]
              },
              {
                "name": "Gaoual",
                "cities": ["Gaoual", "Koundara", "Toubacouta"]
              },
              {
                "name": "Gueckedou",
                "cities": ["Gueckedou", "Kissidougou", "Siguiri"]
              },
              {
                "name": "Kankan",
                "cities": ["Kankan", "Konakry", "Kankan"]
              },
              {
                "name": "Kerouane",
                "cities": ["Kerouane", "Toubacouta", "Tissa"]
              },
              {
                "name": "Kindia",
                "cities": ["Kindia", "Faranah", "N'zérékoré"]
              },
              {
                "name": "Kissidougou",
                "cities": ["Kissidougou", "Siguiri", "Faranah"]
              },
              {
                "name": "Koubia",
                "cities": ["Koubia", "Labé", "Beyla"]
              },
              {
                "name": "Koundara",
                "cities": ["Koundara", "Matoto", "Tissa"]
              },
              {
                "name": "Kouroussa",
                "cities": ["Kouroussa", "Mali", "Mamou"]
              },
              {
                "name": "Labe",
                "cities": ["Labe", "Toubacouta", "Mali"]
              },
              {
                "name": "Lelouma",
                "cities": ["Lelouma", "Mamou", "Kissidougou"]
              },
              {
                "name": "Lola",
                "cities": ["Lola", "Beyla", "Mali"]
              },
              {
                "name": "Macenta",
                "cities": ["Macenta", "Kissidougou", "Siguiri"]
              },
              {
                "name": "Mali",
                "cities": ["Mali", "Kankan", "Siguiri"]
              },
              {
                "name": "Mamou",
                "cities": ["Mamou", "Labé", "Siguiri"]
              },
              {
                "name": "Mandiana",
                "cities": ["Mandiana", "Labé", "Kissidougou"]
              },
              {
                "name": "Nzerekore",
                "cities": ["Nzerekore", "Kankan", "Siguiri"]
              },
              {
                "name": "Pita",
                "cities": ["Pita", "Labe", "Toubacouta"]
              },
              {
                "name": "Siguiri",
                "cities": ["Siguiri", "Nzerekore", "Macenta"]
              },
              {
                "name": "Telimele",
                "cities": ["Telimele", "Toubacouta", "Faranah"]
              },
              {
                "name": "Tougue",
                "cities": ["Tougue", "Mali", "Siguiri"]
              },
              {
                "name": "Yomou",
                "cities": ["Yomou", "Mali", "Siguiri"]
              }
            ]
          },

          {
            "country": "Guinea-Bissau",
            "states": [
              { "name": "Bafata", "cities": ["Bafatá", "Contuboel", "Gamamudo"] },
              { "name": "Biombo", "cities": ["Quinhamel", "Safim", "Prabis"] },
              { "name": "Bissau", "cities": ["Bissau"] },
              { "name": "Bolama", "cities": ["Bolama", "Bubaque", "Caravela"] },
              { "name": "Cacheu", "cities": ["Cacheu", "Canchungo", "São Domingos"] },
              { "name": "Gabu", "cities": ["Gabú", "Sonaco", "Pitche"] },
              { "name": "Oio", "cities": ["Farim", "Mansaba", "Nhacra"] },
              { "name": "Quinara", "cities": ["Buba", "Fulacunda", "Tite"] },
              { "name": "Tombali", "cities": ["Catió", "Bedanda", "Quebo"] }
            ]
          },
          {
            "country": "Guyana",
            "states": [
              { "name": "Barima-Waini", "cities": ["Mabaruma", "Port Kaituma", "Morawhanna"] },
              { "name": "Cuyuni-Mazaruni", "cities": ["Bartica", "Issano", "Kamarang"] },
              { "name": "Demerara-Mahaica", "cities": ["Georgetown", "Mahaica", "Buxton"] },
              { "name": "East Berbice-Corentyne", "cities": ["New Amsterdam", "Rose Hall", "Corriverton"] },
              { "name": "Essequibo Islands-West Demerara", "cities": ["Vreed-en-Hoop", "Parika", "Schoon Ord"] },
              { "name": "Mahaica-Berbice", "cities": ["Rosignol", "Fort Wellington", "Belladrum"] },
              { "name": "Pomeroon-Supenaam", "cities": ["Anna Regina", "Charity", "Spring Garden"] },
              { "name": "Potaro-Siparuni", "cities": ["Mahdia", "Tumatumari", "Kangaruma"] },
              { "name": "Upper Demerara-Berbice", "cities": ["Linden", "Ituni", "Kwakwani"] },
              { "name": "Upper Takutu-Upper Essequibo", "cities": ["Lethem", "Aishalton", "Surama"] }
            ]
          },
          {
            "country": "Haiti",
            "states": [
              { "name": "Artibonite", "cities": ["Gonaïves", "Saint-Marc", "Desdunes"] },
              { "name": "Centre", "cities": ["Hinche", "Mirebalais", "Lascahobas"] },
              { "name": "Grand 'Anse", "cities": ["Jérémie", "Anse-d'Hainault", "Dame-Marie"] },
              { "name": "Nord", "cities": ["Cap-Haïtien", "Limbé", "Plaisance"] },
              { "name": "Nord-Est", "cities": ["Fort-Liberté", "Trou-du-Nord", "Ouanaminthe"] },
              { "name": "Nord-Ouest", "cities": ["Port-de-Paix", "Saint-Louis-du-Nord", "Môle-Saint-Nicolas"] },
              { "name": "Ouest", "cities": ["Port-au-Prince", "Carrefour", "Pétion-Ville"] },
              { "name": "Sud", "cities": ["Les Cayes", "Aquin", "Côteaux"] },
              { "name": "Sud-Est", "cities": ["Jacmel", "Marigot", "Bainet"] }
            ]
          },
          {
            "country": "Honduras",
            "states": [
              { "name": "Atlantida", "cities": ["La Ceiba", "Tela", "El Porvenir"] },
              { "name": "Choluteca", "cities": ["Choluteca", "San Marcos de Colón", "Pespire"] },
              { "name": "Colon", "cities": ["Trujillo", "Tocoa", "Sonaguera"] },
              { "name": "Comayagua", "cities": ["Comayagua", "Siguatepeque", "La Trinidad"] },
              { "name": "Copan", "cities": ["Santa Rosa de Copán", "Copán Ruinas", "Dulce Nombre"] },
              { "name": "Cortes", "cities": ["San Pedro Sula", "Villanueva", "La Lima"] },
              { "name": "El Paraiso", "cities": ["Yuscarán", "Danlí", "Trojes"] },
              { "name": "Francisco Morazan", "cities": ["Tegucigalpa", "Comayagüela", "Valle de Ángeles"] },
              { "name": "Gracias a Dios", "cities": ["Puerto Lempira", "Brus Laguna", "Ahuas"] },
              { "name": "Intibuca", "cities": ["La Esperanza", "Camasca", "San Juan"] },
              { "name": "Islas de la Bahia", "cities": ["Roatán", "Guanaja", "Utila"] },
              { "name": "La Paz", "cities": ["La Paz", "Marcala", "San Pedro de Tutule"] },
              { "name": "Lempira", "cities": ["Gracias", "Lepaera", "San Manuel Colohete"] },
              { "name": "Ocotepeque", "cities": ["Ocotepeque", "Sensenti", "San Marcos"] },
              { "name": "Olancho", "cities": ["Juticalpa", "Catacamas", "San Francisco de la Paz"] },
              { "name": "Santa Barbara", "cities": ["Santa Bárbara", "Trinidad", "San Luis"] },
              { "name": "Valle", "cities": ["Nacaome", "San Lorenzo", "Langue"] },
              { "name": "Yoro", "cities": ["Yoro", "El Progreso", "Olanchito"] }
            ]
          },
          {
            "country": "Hong Kong",
            "states": []
          },

          {
            "country": "Hungary",
            "states": [
              { "name": "Bacs-Kiskun", "cities": ["Kecskemét", "Kiskunfélegyháza", "Baja"] },
              { "name": "Baranya", "cities": ["Pécs", "Szigetvár", "Mohács"] },
              { "name": "Bekes", "cities": ["Békéscsaba", "Orosháza", "Gyula"] },
              { "name": "Borsod-Abauj-Zemplen", "cities": ["Miskolc", "Szerencs", "Sárospatak"] },
              { "name": "Csongrad", "cities": ["Szeged", "Hódmezővásárhely", "Makó"] },
              { "name": "Fejer", "cities": ["Székesfehérvár", "Dunaújváros", "Bicske"] },
              { "name": "Gyor-Moson-Sopron", "cities": ["Győr", "Sopron", "Mosonmagyaróvár"] },
              { "name": "Hajdu-Bihar", "cities": ["Debrecen", "Hajdúszoboszló", "Balmazújváros"] },
              { "name": "Heves", "cities": ["Eger", "Gyöngyös", "Hatvan"] },
              { "name": "Jasz-Nagykun-Szolnok", "cities": ["Szolnok", "Jászberény", "Karcag"] },
              { "name": "Komarom-Esztergom", "cities": ["Tatabánya", "Esztergom", "Komárom"] },
              { "name": "Nograd", "cities": ["Salgótarján", "Balassagyarmat", "Bátonyterenye"] },
              { "name": "Pest", "cities": ["Budapest", "Érd", "Szentendre"] },
              { "name": "Somogy", "cities": ["Kaposvár", "Siófok", "Marcali"] },
              { "name": "Szabolcs-Szatmar-Bereg", "cities": ["Nyíregyháza", "Mátészalka", "Kisvárda"] },
              { "name": "Tolna", "cities": ["Szekszárd", "Paks", "Dombóvár"] },
              { "name": "Vas", "cities": ["Szombathely", "Kőszeg", "Sárvár"] },
              { "name": "Veszprem", "cities": ["Veszprém", "Pápa", "Tapolca"] },
              { "name": "Zala", "cities": ["Zalaegerszeg", "Nagykanizsa", "Keszthely"] },
              { "name": "Bekescsaba", "cities": ["Békéscsaba"] },
              { "name": "Debrecen", "cities": ["Debrecen"] },
              { "name": "Dunaujvaros", "cities": ["Dunaújváros"] },
              { "name": "Eger", "cities": ["Eger"] },
              { "name": "Gyor", "cities": ["Győr"] },
              { "name": "Hodmezovasarhely", "cities": ["Hódmezővásárhely"] },
              { "name": "Kaposvar", "cities": ["Kaposvár"] },
              { "name": "Kecskemet", "cities": ["Kecskemét"] },
              { "name": "Miskolc", "cities": ["Miskolc"] },
              { "name": "Nagykanizsa", "cities": ["Nagykanizsa"] },
              { "name": "Nyiregyhaza", "cities": ["Nyíregyháza"] },
              { "name": "Pecs", "cities": ["Pécs"] },
              { "name": "Sopron", "cities": ["Sopron"] },
              { "name": "Szeged", "cities": ["Szeged"] },
              { "name": "Szekesfehervar", "cities": ["Székesfehérvár"] },
              { "name": "Szolnok", "cities": ["Szolnok"] },
              { "name": "Szombathely", "cities": ["Szombathely"] },
              { "name": "Tatabanya", "cities": ["Tatabánya"] },
              { "name": "Veszprem", "cities": ["Veszprém"] },
              { "name": "Zalaegerszeg", "cities": ["Zalaegerszeg"] }
            ]
          },
          {
            "country": "Iceland",
            "states": [
              { "name": "Austurland", "cities": ["Egilsstaðir", "Reyðarfjörður", "Fáskrúðsfjörður"] },
              { "name": "Hofudhborgarsvaedhi", "cities": ["Reykjavík", "Kópavogur", "Hafnarfjörður"] },
              { "name": "Nordhurland Eystra", "cities": ["Akureyri", "Húsavík", "Laugar"] },
              { "name": "Nordhurland Vestra", "cities": ["Sauðárkrókur", "Blönduós", "Varmahlíð"] },
              { "name": "Sudhurland", "cities": ["Selfoss", "Hveragerði", "Vík"] },
              { "name": "Sudhurnes", "cities": ["Keflavík", "Reykjanesbær", "Grindavík"] },
              { "name": "Vestfirdhir", "cities": ["Ísafjörður", "Bolungarvík", "Patreksfjörður"] },
              { "name": "Vesturland", "cities": ["Akranes", "Borgarnes", "Grundarfjörður"] }
            ]
          },

          {
            "country": "India",
            "states": [
              {
                "name": "Andaman and Nicobar Islands",
                "cities": ["Port Blair", "Diglipur", "Mayabunder"]
              },
              {
                "name": "Andhra Pradesh",
                "cities": ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur"]
              },
              {
                "name": "Arunachal Pradesh",
                "cities": ["Itanagar", "Tawang", "Ziro", "Naharlagun"]
              },
              {
                "name": "Assam",
                "cities": ["Guwahati", "Dibrugarh", "Jorhat", "Nagaon"]
              },
              {
                "name": "Bihar",
                "cities": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"]
              },
              {
                "name": "Chandigarh",
                "cities": ["Chandigarh"]
              },
              {
                "name": "Chhattisgarh",
                "cities": ["Raipur", "Bilaspur", "Korba", "Durg"]
              },
              {
                "name": "Dadra and Nagar Haveli",
                "cities": ["Silvassa"]
              },
              {
                "name": "Daman and Diu",
                "cities": ["Daman", "Diu"]
              },
              {
                "name": "Delhi",
                "cities": ["New Delhi", "Old Delhi", "Connaught Place", "Janakpuri"]
              },
              {
                "name": "Goa",
                "cities": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"]
              },
              {
                "name": "Gujarat",
                "cities": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
              },
              {
                "name": "Haryana",
                "cities": ["Chandigarh", "Faridabad", "Gurugram", "Ambala"]
              },
              {
                "name": "Himachal Pradesh",
                "cities": ["Shimla", "Manali", "Dharamshala", "Kullu"]
              },
              {
                "name": "Jammu and Kashmir",
                "cities": ["Srinagar", "Jammu", "Leh", "Kargil"]
              },
              {
                "name": "Jharkhand",
                "cities": ["Ranchi", "Jamshedpur", "Dhanbad", "Deoghar"]
              },
              {
                "name": "Karnataka",
                "cities": ["Bengaluru", "Mysuru", "Hubli", "Mangalore"]
              },
              {
                "name": "Kerala",
                "cities": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"]
              },
              {
                "name": "Lakshadweep",
                "cities": ["Kavaratti"]
              },
              {
                "name": "Madhya Pradesh",
                "cities": ["Bhopal", "Indore", "Gwalior", "Ujjain"]
              },
              {
                "name": "Maharashtra",
                "cities": ["Mumbai", "Pune", "Nagpur", "Nashik"]
              },
              {
                "name": "Manipur",
                "cities": ["Imphal", "Thoubal", "Churachandpur"]
              },
              {
                "name": "Meghalaya",
                "cities": ["Shillong", "Tura", "Jowai"]
              },
              {
                "name": "Mizoram",
                "cities": ["Aizawl", "Lunglei", "Champhai"]
              },
              {
                "name": "Nagaland",
                "cities": ["Kohima", "Dimapur", "Mokokchung"]
              },
              {
                "name": "Orissa",
                "cities": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"]
              },
              {
                "name": "Pondicherry",
                "cities": ["Puducherry", "Auroville"]
              },
              {
                "name": "Punjab",
                "cities": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar"]
              },
              {
                "name": "Rajasthan",
                "cities": ["Jaipur", "Udaipur", "Jodhpur", "Ajmer"]
              },
              {
                "name": "Sikkim",
                "cities": ["Gangtok", "Namchi", "Pakyong"]
              },
              {
                "name": "Tamil Nadu",
                "cities": ["Chennai", "Coimbatore", "Madurai", "Trichy"]
              },
              {
                "name": "Tripura",
                "cities": ["Agartala", "Udaipur", "Dharmanagar"]
              },
              {
                "name": "Uttaranchal",
                "cities": ["Dehradun", "Nainital", "Haridwar", "Rishikesh"]
              },
              {
                "name": "Uttar Pradesh",
                "cities": ["Lucknow", "Kanpur", "Varanasi", "Agra"]
              },
              {
                "name": "West Bengal",
                "cities": ["Kolkata", "Siliguri", "Durgapur", "Asansol"]
              }
            ]
          },

          {
            "country": "Indonesia",
            "states": [
              {
                "name": "Aceh",
                "cities": ["Banda Aceh", "Lhokseumawe", "Sabang"]
              },
              {
                "name": "Bali",
                "cities": ["Denpasar", "Ubud", "Singaraja"]
              },
              {
                "name": "Banten",
                "cities": ["Serang", "Tangerang", "Cilegon"]
              },
              {
                "name": "Bengkulu",
                "cities": ["Bengkulu", "Curup", "Mukomuko"]
              },
              {
                "name": "Gorontalo",
                "cities": ["Gorontalo", "Tilamuta", "Atinggola"]
              },
              {
                "name": "Irian Jaya Barat",
                "cities": ["Manokwari", "Sorong", "Fakfak"]
              },
              {
                "name": "Jakarta Raya",
                "cities": ["Jakarta"]
              },
              {
                "name": "Jambi",
                "cities": ["Jambi", "Sungai Penuh", "Muara Bulian"]
              },
              {
                "name": "Jawa Barat",
                "cities": ["Bandung", "Bogor", "Bekasi"]
              },
              {
                "name": "Jawa Tengah",
                "cities": ["Semarang", "Solo", "Salatiga"]
              },
              {
                "name": "Jawa Timur",
                "cities": ["Surabaya", "Malang", "Madiun"]
              },
              {
                "name": "Kalimantan Barat",
                "cities": ["Pontianak", "Singkawang", "Sambas"]
              },
              {
                "name": "Kalimantan Selatan",
                "cities": ["Banjarmasin", "Banjarbaru", "Martapura"]
              },
              {
                "name": "Kalimantan Tengah",
                "cities": ["Palangkaraya", "Pangkalan Bun", "Kuala Pembuang"]
              },
              {
                "name": "Kalimantan Timur",
                "cities": ["Samarinda", "Balikpapan", "Bontang"]
              },
              {
                "name": "Kepulauan Bangka Belitung",
                "cities": ["Pangkal Pinang", "Toboali", "Mentok"]
              },
              {
                "name": "Kepulauan Riau",
                "cities": ["Batam", "Tanjungpinang", "Natuna"]
              },
              {
                "name": "Lampung",
                "cities": ["Bandar Lampung", "Metro", "Pringsewu"]
              },
              {
                "name": "Maluku",
                "cities": ["Ambon", "Ternate", "Saumlaki"]
              },
              {
                "name": "Maluku Utara",
                "cities": ["Ternate", "Tidore", "Halmahera"]
              },
              {
                "name": "Nusa Tenggara Barat",
                "cities": ["Mataram", "Lombok", "Sumbawa"]
              },
              {
                "name": "Nusa Tenggara Timur",
                "cities": ["Kupang", "Atambua", "Maumere"]
              },
              {
                "name": "Papua",
                "cities": ["Jayapura", "Timika", "Merauke"]
              },
              {
                "name": "Riau",
                "cities": ["Pekanbaru", "Dumai", "Bengkalis"]
              },
              {
                "name": "Sulawesi Barat",
                "cities": ["Mamuju", "Majene", "Polewali"]
              },
              {
                "name": "Sulawesi Selatan",
                "cities": ["Makassar", "Parepare", "Palopo"]
              },
              {
                "name": "Sulawesi Tengah",
                "cities": ["Palu", "Poso", "Donggala"]
              },
              {
                "name": "Sulawesi Tenggara",
                "cities": ["Kendari", "Baubau", "Kolaka"]
              },
              {
                "name": "Sulawesi Utara",
                "cities": ["Manado", "Tomohon", "Bitung"]
              },
              {
                "name": "Sumatera Barat",
                "cities": ["Padang", "Bukittinggi", "Payakumbuh"]
              },
              {
                "name": "Sumatera Selatan",
                "cities": ["Palembang", "Prabumulih", "Baturaja"]
              },
              {
                "name": "Sumatera Utara",
                "cities": ["Medan", "Binjai", "Pematangsiantar"]
              },
              {
                "name": "Yogyakarta",
                "cities": ["Yogyakarta", "Sleman", "Bantul"]
              }
            ]
          },
          {
            "country": "Iran",
            "states": [
              {
                "name": "Ardabil",
                "cities": ["Ardabil", "Meshgin Shahr", "Khalkhal"]
              },
              {
                "name": "Azarbayjan-e Gharbi",
                "cities": ["Urmia", "Khoy", "Salmas"]
              },
              {
                "name": "Azarbayjan-e Sharqi",
                "cities": ["Tabriz", "Maragheh", "Ahar"]
              },
              {
                "name": "Bushehr",
                "cities": ["Bushehr", "Assaluyeh", "Kangan"]
              },
              {
                "name": "Chahar Mahall va Bakhtiari",
                "cities": ["Shahr-e Kord", "Farsan", "Kiar"]
              },
              {
                "name": "Esfahan",
                "cities": ["Isfahan", "Kashan", "Shahin Shahr"]
              },
              {
                "name": "Fars",
                "cities": ["Shiraz", "Marvdasht", "Fasa"]
              },
              {
                "name": "Gilan",
                "cities": ["Rasht", "Lahijan", "Astara"]
              },
              {
                "name": "Golestan",
                "cities": ["Gorgan", "Aliabad", "Kordkuy"]
              },
              {
                "name": "Hamadan",
                "cities": ["Hamadan", "Malayer", "Asadabad"]
              },
              {
                "name": "Hormozgan",
                "cities": ["Bandar Abbas", "Minab", "Jask"]
              },
              {
                "name": "Ilam",
                "cities": ["Ilam", "Dehloran", "Mehran"]
              },
              {
                "name": "Kerman",
                "cities": ["Kerman", "Rafsanjan", "Bam"]
              },
              {
                "name": "Kermanshah",
                "cities": ["Kermanshah", "Harsin", "Sarpol-e Zahab"]
              },
              {
                "name": "Khorasan-e Janubi",
                "cities": ["Birjand", "Ghaen", "Ferdows"]
              },
              {
                "name": "Khorasan-e Razavi",
                "cities": ["Mashhad", "Nishapur", "Torbat-e Jam"]
              },
              {
                "name": "Khorasan-e Shemali",
                "cities": ["Bojnurd", "Shirvan", "Esfarayen"]
              },
              {
                "name": "Khuzestan",
                "cities": ["Ahvaz", "Abadan", "Khorramshahr"]
              },
              {
                "name": "Kohgiluyeh va Buyer Ahmad",
                "cities": ["Yasuj", "Gachsaran", "Dehdasht"]
              },
              {
                "name": "Kordestan",
                "cities": ["Sanandaj", "Baneh", "Marivan"]
              },
              {
                "name": "Lorestan",
                "cities": ["Khorramabad", "Borujerd", "Aligudarz"]
              },
              {
                "name": "Markazi",
                "cities": ["Arak", "Saveh", "Khomein"]
              },
              {
                "name": "Mazandaran",
                "cities": ["Sari", "Amol", "Babol"]
              },
              {
                "name": "Qazvin",
                "cities": ["Qazvin", "Alborz", "Takestan"]
              },
              {
                "name": "Qom",
                "cities": ["Qom"]
              },
              {
                "name": "Semnan",
                "cities": ["Semnan", "Shahroud", "Garmsar"]
              },
              {
                "name": "Sistan va Baluchestan",
                "cities": ["Zahedan", "Chabahar", "Zabol"]
              },
              {
                "name": "Tehran",
                "cities": ["Tehran", "Karaj", "Qarchak"]
              },
              {
                "name": "Yazd",
                "cities": ["Yazd", "Khatam", "Mehriz"]
              },
              {
                "name": "Zanjan",
                "cities": ["Zanjan", "Khorramdarreh", "Tarom"]
              }
            ]
          },
          {
            "country": "Iraq",
            "states": [
              {
                "name": "Al Anbar",
                "cities": ["Ramadi", "Fallujah", "Haditha"]
              },
              {
                "name": "Al Basrah",
                "cities": ["Basrah", "Zubair", "Umm Qasr"]
              },
              {
                "name": "Al Muthanna",
                "cities": ["Samawah", "Al Khidhir", "Al Majar al-Kabir"]
              },
              {
                "name": "Al Qadisiyah",
                "cities": ["Diwaniya", "Al-Hilla", "Al-Samawah"]
              },
              {
                "name": "An Najaf",
                "cities": ["Najaf", "Kufa", "Al-Qadisiyyah"]
              },
              {
                "name": "Arbil",
                "cities": ["Erbil", "Shaqlawa", "Makhmur"]
              },
              {
                "name": "As Sulaymaniyah",
                "cities": ["Sulaymaniyah", "Ranya", "Kirkuk"]
              },
              {
                "name": "At Ta'mim",
                "cities": ["Kirkuk", "Hawija", "Dibis"]
              },
              {
                "name": "Babil",
                "cities": ["Hillah", "Musayyib", "Al-Qasim"]
              },
              {
                "name": "Baghdad",
                "cities": ["Baghdad", "Sadr City", "Kadhimiyah"]
              },
              {
                "name": "Dahuk",
                "cities": ["Dahuk", "Amedi", "Zakho"]
              },
              {
                "name": "Dhi Qar",
                "cities": ["Nasiriyah", "Qal'at Sukkar", "Al-Chibayish"]
              },
              {
                "name": "Diyala",
                "cities": ["Baqubah", "Muqdadiya", "Khanaqin"]
              },
              {
                "name": "Karbala'",
                "cities": ["Karbala", "Al-Hindiya", "Al-Rifa'i"]
              },
              {
                "name": "Maysan",
                "cities": ["Amarah", "Ali al-Gharbi", "Majar al-Kabir"]
              },
              {
                "name": "Ninawa",
                "cities": ["Mosul", "Tal Afar", "Al-Qayyara"]
              },
              {
                "name": "Salah ad Din",
                "cities": ["Tikrit", "Balad", "Samarra"]
              },
              {
                "name": "Wasit",
                "cities": ["Kut", "Al-Kut", "Al-Suwaira"]
              }
            ]
          },
          {
            "country": "Ireland",
            "states": [
              {
                "name": "Carlow",
                "cities": ["Carlow", "Tullow", "Bagenalstown"]
              },
              {
                "name": "Cavan",
                "cities": ["Cavan", "Belturbet", "Kingscourt"]
              },
              {
                "name": "Clare",
                "cities": ["Ennis", "Shannon", "Kilrush"]
              },
              {
                "name": "Cork",
                "cities": ["Cork", "Mallow", "Bandon"]
              },
              {
                "name": "Donegal",
                "cities": ["Letterkenny", "Bundoran", "Ballybofey"]
              },
              {
                "name": "Dublin",
                "cities": ["Dublin"]
              },
              {
                "name": "Galway",
                "cities": ["Galway", "Loughrea", "Tuam"]
              },
              {
                "name": "Kerry",
                "cities": ["Tralee", "Killarney", "Listowel"]
              },
              {
                "name": "Kildare",
                "cities": ["Naas", "Newbridge", "Kildare"]
              },
              {
                "name": "Kilkenny",
                "cities": ["Kilkenny", "Thomastown", "Callan"]
              },
              {
                "name": "Laois",
                "cities": ["Portlaoise", "Mountmellick", "Borris-in-Ossory"]
              },
              {
                "name": "Leitrim",
                "cities": ["Carrick-on-Shannon", "Drumshanbo", "Ballinamore"]
              },
              {
                "name": "Limerick",
                "cities": ["Limerick", "Adare", "Newcastle West"]
              },
              {
                "name": "Longford",
                "cities": ["Longford", "Edgeworthstown", "Granard"]
              },
              {
                "name": "Louth",
                "cities": ["Drogheda", "Dundalk", "Ardee"]
              },
              {
                "name": "Mayo",
                "cities": ["Castlebar", "Ballina", "Westport"]
              },
              {
                "name": "Meath",
                "cities": ["Navan", "Dunshaughlin", "Trim"]
              },
              {
                "name": "Monaghan",
                "cities": ["Monaghan", "Carrickmacross", "Castleblayney"]
              },
              {
                "name": "Offaly",
                "cities": ["Tullamore", "Banagher", "Birr"]
              },
              {
                "name": "Roscommon",
                "cities": ["Roscommon", "Castlerea", "Boyle"]
              },
              {
                "name": "Sligo",
                "cities": ["Sligo", "Enniscrone", "Ballymote"]
              },
              {
                "name": "Tipperary",
                "cities": ["Clonmel", "Nenagh", "Thurles"]
              },
              {
                "name": "Waterford",
                "cities": ["Waterford", "Dungarvan", "Tramore"]
              },
              {
                "name": "Westmeath",
                "cities": ["Mullingar", "Athlone", "Moate"]
              },
              {
                "name": "Wexford",
                "cities": ["Wexford", "Gorey", "New Ross"]
              },
              {
                "name": "Wicklow",
                "cities": ["Wicklow", "Arklow", "Baltinglass"]
              }
            ]
          },
          {
            "country": "Israel",
            "states": [
              {
                "name": "Central",
                "cities": ["Rishon Lezion", "Holon", "Petah Tikva"]
              },
              {
                "name": "Haifa",
                "cities": ["Haifa", "Nesher", "Kiryat Bialik"]
              },
              {
                "name": "Jerusalem",
                "cities": ["Jerusalem", "Bethlehem", "Abu Dis"]
              },
              {
                "name": "Northern",
                "cities": ["Nazareth", "Afula", "Karmiel"]
              },
              {
                "name": "Southern",
                "cities": ["Beersheba", "Eilat", "Dimona"]
              },
              {
                "name": "Tel Aviv",
                "cities": ["Tel Aviv", "Bat Yam", "Herzliya"]
              }
            ]
          },
          {
            "country": "Italy",
            "states": [
              {
                "name": "Abruzzo",
                "cities": ["L'Aquila", "Pescara", "Teramo"]
              },
              {
                "name": "Basilicata",
                "cities": ["Potenza", "Matera"]
              },
              {
                "name": "Calabria",
                "cities": ["Catanzaro", "Reggio Calabria", "Cosenza"]
              },
              {
                "name": "Campania",
                "cities": ["Naples", "Salerno", "Caserta"]
              },
              {
                "name": "Emilia-Romagna",
                "cities": ["Bologna", "Modena", "Parma"]
              },
              {
                "name": "Friuli-Venezia Giulia",
                "cities": ["Trieste", "Udine", "Gorizia"]
              },
              {
                "name": "Lazio",
                "cities": ["Rome", "Latina", "Viterbo"]
              },
              {
                "name": "Liguria",
                "cities": ["Genoa", "La Spezia", "Savona"]
              },
              {
                "name": "Lombardia",
                "cities": ["Milan", "Bergamo", "Brescia"]
              },
              {
                "name": "Marche",
                "cities": ["Ancona", "Pesaro", "Fermo"]
              },
              {
                "name": "Molise",
                "cities": ["Campobasso", "Isernia"]
              },
              {
                "name": "Piemonte",
                "cities": ["Turin", "Novara", "Alessandria"]
              },
              {
                "name": "Puglia",
                "cities": ["Bari", "Lecce", "Taranto"]
              },
              {
                "name": "Sardegna",
                "cities": ["Cagliari", "Sassari", "Olbia"]
              },
              {
                "name": "Sicilia",
                "cities": ["Palermo", "Catania", "Messina"]
              },
              {
                "name": "Toscana",
                "cities": ["Florence", "Pisa", "Siena"]
              },
              {
                "name": "Trentino-Alto Adige",
                "cities": ["Trento", "Bolzano"]
              },
              {
                "name": "Umbria",
                "cities": ["Perugia", "Terni"]
              },
              {
                "name": "Valle d'Aosta",
                "cities": ["Aosta"]
              },
              {
                "name": "Veneto",
                "cities": ["Venice", "Verona", "Padua"]
              }
            ]
          },
          {
            "country": "Jamaica",
            "states": [
              {
                "name": "Clarendon",
                "cities": ["May Pen", "Chapleton", "Lionel Town"]
              },
              {
                "name": "Hanover",
                "cities": ["Lucea", "Green Island"]
              },
              {
                "name": "Kingston",
                "cities": ["Kingston"]
              },
              {
                "name": "Manchester",
                "cities": ["Mandeville", "Christiana"]
              },
              {
                "name": "Portland",
                "cities": ["Port Antonio", "Buff Bay"]
              },
              {
                "name": "Saint Andrew",
                "cities": ["Kingston", "Half Way Tree"]
              },
              {
                "name": "Saint Ann",
                "cities": ["Ocho Rios", "Runaway Bay", "Brown's Town"]
              },
              {
                "name": "Saint Catherine",
                "cities": ["Spanish Town", "Portmore"]
              },
              {
                "name": "Saint Elizabeth",
                "cities": ["Black River", "Santa Cruz"]
              },
              {
                "name": "Saint James",
                "cities": ["Montego Bay", "Rose Hall"]
              },
              {
                "name": "Saint Mary",
                "cities": ["Port Maria", "Ocho Rios"]
              },
              {
                "name": "Saint Thomas",
                "cities": ["Morant Bay", "Seaforth"]
              },
              {
                "name": "Trelawny",
                "cities": ["Falmouth", "Duncans"]
              },
              {
                "name": "Westmoreland",
                "cities": ["Savanna-la-Mar", "Negril"]
              }
            ]
          },
          {
            "country": "Japan",
            "states": [
              {
                "name": "Aichi",
                "cities": ["Nagoya", "Toyota", "Okazaki"]
              },
              {
                "name": "Akita",
                "cities": ["Akita", "Honjo", "Yurihonjo"]
              },
              {
                "name": "Aomori",
                "cities": ["Aomori", "Hachinohe", "Hirosaki"]
              },
              {
                "name": "Chiba",
                "cities": ["Chiba", "Narita", "Funabashi"]
              },
              {
                "name": "Ehime",
                "cities": ["Matsuyama", "Imabari", "Saijo"]
              },
              {
                "name": "Fukui",
                "cities": ["Fukui", "Sabae", "Echizen"]
              },
              {
                "name": "Fukuoka",
                "cities": ["Fukuoka", "Kitakyushu", "Kurume"]
              },
              {
                "name": "Fukushima",
                "cities": ["Fukushima", "Koriyama", "Iwaki"]
              },
              {
                "name": "Gifu",
                "cities": ["Gifu", "Ogaki", "Kakamigahara"]
              },
              {
                "name": "Gumma",
                "cities": ["Maebashi", "Takasaki", "Isesaki"]
              },
              {
                "name": "Hiroshima",
                "cities": ["Hiroshima", "Miyajima", "Kure"]
              },
              {
                "name": "Hokkaido",
                "cities": ["Sapporo", "Asahikawa", "Otaru"]
              },
              {
                "name": "Hyogo",
                "cities": ["Kobe", "Himeji", "Takarazuka"]
              },
              {
                "name": "Ibaraki",
                "cities": ["Mito", "Hitachi", "Tsukuba"]
              },
              {
                "name": "Ishikawa",
                "cities": ["Kanazawa", "Wajima", "Suematsu"]
              },
              {
                "name": "Iwate",
                "cities": ["Morioka", "Ichinoseki", "Hanamaki"]
              },
              {
                "name": "Kagawa",
                "cities": ["Takamatsu", "Marugame", "Zentsuji"]
              },
              {
                "name": "Kagoshima",
                "cities": ["Kagoshima", "Ibusuki", "Kirishima"]
              },
              {
                "name": "Kanagawa",
                "cities": ["Yokohama", "Kawasaki", "Kamakura"]
              },
              {
                "name": "Kochi",
                "cities": ["Kochi", "Nankoku", "Mizuno"]
              },
              {
                "name": "Kumamoto",
                "cities": ["Kumamoto", "Kikuchi", "Arao"]
              },
              {
                "name": "Kyoto",
                "cities": ["Kyoto", "Uji", "Maizuru"]
              },
              {
                "name": "Mie",
                "cities": ["Tsu", "Ise", "Yokkaichi"]
              },
              {
                "name": "Miyagi",
                "cities": ["Sendai", "Shiogama", "Ishinomaki"]
              },
              {
                "name": "Miyazaki",
                "cities": ["Miyazaki", "Hyuga", "Nobeoka"]
              },
              {
                "name": "Nagano",
                "cities": ["Nagano", "Matsumoto", "Iida"]
              },
              {
                "name": "Nagasaki",
                "cities": ["Nagasaki", "Sasebo", "Isahaya"]
              },
              {
                "name": "Nara",
                "cities": ["Nara", "Kashihara", "Yamatokoriyama"]
              },
              {
                "name": "Niigata",
                "cities": ["Niigata", "Sanjo", "Kashiwazaki"]
              },
              {
                "name": "Oita",
                "cities": ["Oita", "Beppu", "Usuki"]
              },
              {
                "name": "Okayama",
                "cities": ["Okayama", "Kurashiki", "Tsuyama"]
              },
              {
                "name": "Okinawa",
                "cities": ["Naha", "Okinawa", "Uruma"]
              },
              {
                "name": "Osaka",
                "cities": ["Osaka", "Sakai", "Toyonaka"]
              },
              {
                "name": "Saga",
                "cities": ["Saga", "Karatsu", "Tosu"]
              },
            
            {
              "name": "Saitama",
              "cities": ["Saitama", "Kawagoe", "Koshigaya"]
            },
            {
              "name": "Shiga",
              "cities": ["Otsu", "Hikone", "Nagahama"]
            },
            {
              "name": "Shimane",
              "cities": ["Matsue", "Izumo", "Unnan"]
            },
            {
              "name": "Shizuoka",
              "cities": ["Shizuoka", "Hamamatsu", "Fuji"]
            },
            {
              "name": "Tochigi",
              "cities": ["Utsunomiya", "Ashikaga", "Kanuma"]
            },
            {
              "name": "Tokushima",
              "cities": ["Tokushima", "Naruto", "Anan"]
            },
            {
              "name": "Tokyo",
              "cities": ["Tokyo", "Shinjuku", "Shibuya"]
            },
            {
              "name": "Tottori",
              "cities": ["Tottori", "Yonago", "Kurayoshi"]
            },
            {
              "name": "Toyama",
              "cities": ["Toyama", "Takaoka", "Uozu"]
            },
            {
              "name": "Wakayama",
              "cities": ["Wakayama", "Hashimoto", "Wakayama"]
            },
            {
              "name": "Yamagata",
              "cities": ["Yamagata", "Tendo", "Sakata"]
            },
            {
              "name": "Yamaguchi",
              "cities": ["Yamaguchi", "Shimonoseki", "Ube"]
            },
            {
              "name": "Yamanashi",
              "cities": ["Kofu", "Fuefuki", "Isawa"]
            },
          ],
        },
        {
          "country": "Jordan",
          "states": [
            {
              "name": "Ajlun",
              "cities": ["Ajlun", "Kufranjah", "Ain Janna"]
            },
            {
              "name": "Al 'Aqabah",
              "cities": ["Aqaba", "Wadi Rum", "Tala Bay"]
            },
            {
              "name": "Al Balqa'",
              "cities": ["Salt", "Mahis", "Ain Al Basha"]
            },
            {
              "name": "Al Karak",
              "cities": ["Al Karak", "Qasr", "Ghawr al Mazra’ah"]
            },
            {
              "name": "Al Mafraq",
              "cities": ["Mafraq", "Ruwaished", "Safawi"]
            },
            {
              "name": "'Amman",
              "cities": ["Amman", "Wadi Al Seer", "Al Jizah"]
            },
            {
              "name": "At Tafilah",
              "cities": ["Tafilah", "Buseirah", "Al Hasa"]
            },
            {
              "name": "Az Zarqa'",
              "cities": ["Zarqa", "Russeifa", "Hashimiya"]
            },
            {
              "name": "Irbid",
              "cities": ["Irbid", "Ramtha", "Al Mazar al Shamali"]
            },
            {
              "name": "Jarash",
              "cities": ["Jerash", "Souf", "Kufranjah"]
            },
            {
              "name": "Ma'an",
              "cities": ["Ma'an", "Petra", "Wadi Musa"]
            },
            {
              "name": "Madaba",
              "cities": ["Madaba", "Dhiban", "Ma'in"]
            }
          ]
        },
        {
          "country": "Kazakhstan",
          "states": [
            {
              "name": "Almaty Oblysy",
              "cities": ["Taldykorgan", "Kapshagay", "Tekeli"]
            },
            {
              "name": "Almaty Qalasy",
              "cities": ["Almaty"]
            },
            {
              "name": "Aqmola Oblysy",
              "cities": ["Kokshetau", "Stepnogorsk", "Shchuchinsk"]
            },
            {
              "name": "Aqtobe Oblysy",
              "cities": ["Aktobe", "Kandyagash", "Khromtau"]
            },
            {
              "name": "Astana Qalasy",
              "cities": ["Astana (Nur-Sultan)"]
            },
            {
              "name": "Atyrau Oblysy",
              "cities": ["Atyrau", "Kulsary", "Makat"]
            },
            {
              "name": "Batys Qazaqstan Oblysy",
              "cities": ["Oral", "Aksay", "Karauylkeldy"]
            },
            {
              "name": "Bayqongyr Qalasy",
              "cities": ["Baikonur"]
            },
            {
              "name": "Mangghystau Oblysy",
              "cities": ["Aktau", "Zhanaozen", "Fort-Shevchenko"]
            },
            {
              "name": "Ongtustik Qazaqstan Oblysy",
              "cities": ["Shymkent", "Turkestan", "Kentau"]
            },
            {
              "name": "Pavlodar Oblysy",
              "cities": ["Pavlodar", "Ekibastuz", "Aksu"]
            },
            {
              "name": "Qaraghandy Oblysy",
              "cities": ["Karaganda", "Temirtau", "Balkhash"]
            },
            {
              "name": "Qostanay Oblysy",
              "cities": ["Kostanay", "Rudny", "Lisakovsk"]
            },
            {
              "name": "Qyzylorda Oblysy",
              "cities": ["Kyzylorda", "Aral", "Shieli"]
            },
            {
              "name": "Shyghys Qazaqstan Oblysy",
              "cities": ["Oskemen", "Ridder", "Ayagoz"]
            },
            {
              "name": "Soltustik Qazaqstan Oblysy",
              "cities": ["Petropavl", "Bulayevo", "Sergeyevka"]
            },
            {
              "name": "Zhambyl Oblysy",
              "cities": ["Taraz", "Shu", "Korday"]
            }
          ]
        },
        {
          "country": "Kenya",
          "states": [
            {
              "name": "Central",
              "cities": ["Nyeri", "Murang'a", "Karuri"]
            },
            {
              "name": "Coast",
              "cities": ["Mombasa", "Malindi", "Lamu"]
            },
            {
              "name": "Eastern",
              "cities": ["Embu", "Machakos", "Meru"]
            },
            {
              "name": "Nairobi Area",
              "cities": ["Nairobi"]
            },
            {
              "name": "North Eastern",
              "cities": ["Garissa", "Wajir", "Mandera"]
            },
            {
              "name": "Nyanza",
              "cities": ["Kisumu", "Kisii", "Homa Bay"]
            },
            {
              "name": "Rift Valley",
              "cities": ["Nakuru", "Eldoret", "Naivasha"]
            },
            {
              "name": "Western",
              "cities": ["Kakamega", "Bungoma", "Busia"]
            }
          ]
        },
        {
          "country": "Kiribati",
          "states": []
        },
        {
          "country": "Korea North",
          "states": [
            {
              "name": "Chagang",
              "cities": ["Kanggye", "Huichon", "Manpo"]
            },
            {
              "name": "North Hamgyong",
              "cities": ["Chongjin", "Kimchaek", "Hoeryong"]
            },
            {
              "name": "South Hamgyong",
              "cities": ["Hamhung", "Sinpo", "Tanchon"]
            },
            {
              "name": "North Hwanghae",
              "cities": ["Sariwon", "Kaesong", "Haeju"]
            },
            {
              "name": "South Hwanghae",
              "cities": ["Haeju", "Pyoksong", "Ongjin"]
            },
            {
              "name": "Kangwon",
              "cities": ["Wonsan", "Munchon", "Kosan"]
            },
            {
              "name": "North P'yongan",
              "cities": ["Sinuiju", "Kusong", "Chongju"]
            },
            {
              "name": "South P'yongan",
              "cities": ["Pyongyang", "Nampo", "Anju"]
            },
            {
              "name": "Yanggang",
              "cities": ["Hyesan", "Samjiyon", "Pochon"]
            },
            {
              "name": "Kaesong",
              "cities": ["Kaesong"]
            },
            {
              "name": "Najin",
              "cities": ["Najin"]
            },
            {
              "name": "Namp'o",
              "cities": ["Nampo"]
            },
            {
              "name": "Pyongyang",
              "cities": ["Pyongyang"]
            }
          ]
        },
        {
          "country": "Korea South",
          "states": [
            {
              "name": "Seoul",
              "cities": ["Seoul"]
            },
            {
              "name": "Busan City",
              "cities": ["Busan"]
            },
            {
              "name": "Daegu City",
              "cities": ["Daegu"]
            },
            {
              "name": "Incheon City",
              "cities": ["Incheon"]
            },
            {
              "name": "Gwangju City",
              "cities": ["Gwangju"]
            },
            {
              "name": "Daejeon City",
              "cities": ["Daejeon"]
            },
            {
              "name": "Ulsan",
              "cities": ["Ulsan"]
            },
            {
              "name": "Gyeonggi Province",
              "cities": ["Suwon", "Seongnam", "Goyang"]
            },
            {
              "name": "Gangwon Province",
              "cities": ["Chuncheon", "Gangneung", "Sokcho"]
            },
            {
              "name": "North Chungcheong Province",
              "cities": ["Cheongju", "Chungju", "Jecheon"]
            },
            {
              "name": "South Chungcheong Province",
              "cities": ["Daejeon", "Asan", "Seosan"]
            },
            {
              "name": "North Jeolla Province",
              "cities": ["Jeonju", "Iksan", "Gunsan"]
            },
            {
              "name": "South Jeolla Province",
              "cities": ["Gwangju", "Mokpo", "Yeosu"]
            },
            {
              "name": "North Gyeongsang Province",
              "cities": ["Daegu", "Pohang", "Gyeongju"]
            },
            {
              "name": "South Gyeongsang Province",
              "cities": ["Busan", "Ulsan", "Changwon"]
            },
            {
              "name": "Jeju",
              "cities": ["Jeju City", "Seogwipo"]
            }
          ]
        },
        {
          "country": "Kuwait",
          "states": [
            {
              "name": "Al Ahmadi",
              "cities": ["Ahmadi", "Fahaheel", "Mangaf"]
            },
            {
              "name": "Al Farwaniyah",
              "cities": ["Farwaniya", "Jleeb Al-Shuyoukh", "Ardiya"]
            },
            {
              "name": "Al Asimah",
              "cities": ["Kuwait City", "Sharq", "Qibla"]
            },
            {
              "name": "Al Jahra",
              "cities": ["Jahra", "Taima", "Nuwaisib"]
            },
            {
              "name": "Hawalli",
              "cities": ["Hawalli", "Salmiya", "Mishref"]
            },
            {
              "name": "Mubarak Al-Kabeer",
              "cities": ["Mubarak Al-Kabeer", "Sabah Al-Salem", "Adan"]
            }
          ]
        },
        {
          "country": "Kyrgyzstan",
          "states": [
            {
              "name": "Batken Oblasty",
              "cities": ["Batken", "Isfana", "Kyzyl-Kiya"]
            },
            {
              "name": "Bishkek Shaary",
              "cities": ["Bishkek"]
            },
            {
              "name": "Chuy Oblasty",
              "cities": ["Tokmok", "Kara-Balta", "Kant"]
            },
            {
              "name": "Jalal-Abad Oblasty",
              "cities": ["Jalal-Abad", "Tash-Kumyr", "Kazarman"]
            },
            {
              "name": "Naryn Oblasty",
              "cities": ["Naryn", "At-Bashy", "Kochkor"]
            },
            {
              "name": "Osh Oblasty",
              "cities": ["Osh", "Uzgen", "Kara-Suu"]
            },
            {
              "name": "Talas Oblasty",
              "cities": ["Talas", "Kara-Buura", "Manas"]
            },
            {
              "name": "Ysyk-Kol Oblasty",
              "cities": ["Karakol", "Cholpon-Ata", "Balykchy"]
            }
          ]
        },
        {
          "country": "Laos",
          "states": [
            {
              "name": "Attapu",
              "cities": ["Attapeu", "Sanamxay", "Phouvong"]
            },
            {
              "name": "Bokeo",
              "cities": ["Ban Houayxay", "Ton Pheung", "Meung"]
            },
            {
              "name": "Bolikhamxai",
              "cities": ["Paksan", "Thaphabat", "Borikhane"]
            },
            {
              "name": "Champasak",
              "cities": ["Pakse", "Champasak", "Soukhouma"]
            },
            {
              "name": "Houaphan",
              "cities": ["Xam Neua", "Viengxay", "Samtai"]
            },
            {
              "name": "Khammouan",
              "cities": ["Thakhek", "Mahaxay", "Nongbok"]
            },
            {
              "name": "Louangnamtha",
              "cities": ["Luang Namtha", "Long", "Viengphoukha"]
            },
            {
              "name": "Louangphrabang",
              "cities": ["Luang Prabang", "Nambak", "Pak Ou"]
            },
            {
              "name": "Oudomxai",
              "cities": ["Muang Xay", "Beng", "Pakbeng"]
            },
            {
              "name": "Phongsali",
              "cities": ["Phongsali", "Boun Neua", "Boun Tai"]
            },
            {
              "name": "Salavan",
              "cities": ["Salavan", "Toumlan", "Lakhonepheng"]
            },
            {
              "name": "Savannakhet",
              "cities": ["Savannakhet", "Kaysone Phomvihane", "Xayphouthong"]
            },
            {
              "name": "Viangchan",
              "cities": ["Vientiane", "Xaysetha", "Sikhottabong"]
            },
            {
              "name": "Xaignabouli",
              "cities": ["Xayabury", "Khop", "Paklai"]
            },
            {
              "name": "Xaisomboun",
              "cities": ["Anouvong", "Longxan", "Thathom"]
            },
            {
              "name": "Xekong",
              "cities": ["Xekong", "Lamarm", "Dak Cheung"]
            },
            {
              "name": "Xiangkhoang",
              "cities": ["Phonsavan", "Kham", "Nong Het"]
            }
          ]
        },
        {
          "country": "Latvia",
          "states": [
            {
              "name": "Aizkraukles Rajons",
              "cities": ["Aizkraukle", "Pļaviņas", "Koknese"]
            },
            {
              "name": "Aluksnes Rajons",
              "cities": ["Alūksne", "Ape", "Jaunanna"]
            },
            {
              "name": "Balvu Rajons",
              "cities": ["Balvi", "Vilaka", "Rugāji"]
            },
            {
              "name": "Bauskas Rajons",
              "cities": ["Bauska", "Iecava", "Vecumnieki"]
            },
            {
              "name": "Cesu Rajons",
              "cities": ["Cēsis", "Līgatne", "Priekuļi"]
            },
            {
              "name": "Daugavpils",
              "cities": ["Daugavpils"]
            },
            {
              "name": "Daugavpils Rajons",
              "cities": ["Daugavpils", "Ilūkste", "Višķi"]
            },
            {
              "name": "Dobeles Rajons",
              "cities": ["Dobele", "Auce", "Tērvete"]
            },
            {
              "name": "Gulbenes Rajons",
              "cities": ["Gulbene", "Līgatne", "Stāmeriena"]
            },
            {
              "name": "Jekabpils Rajons",
              "cities": ["Jēkabpils", "Viesīte", "Krustpils"]
            },
            {
              "name": "Jelgava",
              "cities": ["Jelgava"]
            },
            {
              "name": "Jelgavas Rajons",
              "cities": ["Jelgava", "Ozolnieki", "Tīreļi"]
            },
            {
              "name": "Jurmala",
              "cities": ["Jūrmala"]
            },
            {
              "name": "Kraslavas Rajons",
              "cities": ["Krāslava", "Dagda", "Aglona"]
            },
            {
              "name": "Kuldigas Rajons",
              "cities": ["Kuldīga", "Skrunda", "Alsunga"]
            },
            {
              "name": "Liepaja",
              "cities": ["Liepāja"]
            },
            {
              "name": "Liepajas Rajons",
              "cities": ["Liepāja", "Grobiņa", "Durbe"]
            },
            {
              "name": "Limbazu Rajons",
              "cities": ["Limbaži", "Aloja", "Salacgrīva"]
            },
            {
              "name": "Ludzas Rajons",
              "cities": ["Ludza", "Zilupe", "Cibla"]
            },
            {
              "name": "Madonas Rajons",
              "cities": ["Madona", "Lubāna", "Cesvaine"]
            },
            {
              "name": "Ogres Rajons",
              "cities": ["Ogre", "Ikšķile", "Lielvārde"]
            },
            {
              "name": "Preilu Rajons",
              "cities": ["Preiļi", "Riebiņi", "Vārkava"]
            },
            {
              "name": "Rezekne",
              "cities": ["Rēzekne"]
            },
            {
              "name": "Rezeknes Rajons",
              "cities": ["Rēzekne", "Viļāni", "Lūznava"]
            },
            {
              "name": "Riga",
              "cities": ["Rīga"]
            },
            {
              "name": "Rigas Rajons",
              "cities": ["Rīga", "Olaine", "Salaspils"]
            },
            {
              "name": "Saldus Rajons",
              "cities": ["Saldus", "Brocēni", "Zvārde"]
            },
            {
              "name": "Talsu Rajons",
              "cities": ["Talsi", "Sabile", "Valdemārpils"]
            },
            {
              "name": "Tukuma Rajons",
              "cities": ["Tukums", "Kandava", "Engure"]
            },
            {
              "name": "Valkas Rajons",
              "cities": ["Valka", "Smiltene", "Ērģeme"]
            },
            {
              "name": "Valmieras Rajons",
              "cities": ["Valmiera", "Beverīna", "Burtnieki"]
            },
            {
              "name": "Ventspils",
              "cities": ["Ventspils"]
            },
            {
              "name": "Ventspils Rajons",
              "cities": ["Ventspils", "Piltene", "Ance"]
            }
          ]
        },
        {
          "country": "Lebanon",
          "states": [
            {
              "name": "Beyrouth",
              "cities": ["Beirut", "Ashrafieh", "Hamra"]
            },
            {
              "name": "Beqaa",
              "cities": ["Zahle", "Baalbek", "Joub Jannine"]
            },
            {
              "name": "Liban-Nord",
              "cities": ["Tripoli", "Zgharta", "Bcharre"]
            },
            {
              "name": "Liban-Sud",
              "cities": ["Sidon", "Tyre", "Jezzine"]
            },
            {
              "name": "Mont-Liban",
              "cities": ["Jounieh", "Baabda", "Aley"]
            },
            {
              "name": "Nabatiye",
              "cities": ["Nabatieh", "Marjayoun", "Bint Jbeil"]
            }
          ]
        },
        {
          "country": "Lesotho",
          "states": [
            {
              "name": "Berea",
              "cities": ["Teyateyaneng", "Maputsoe", "Mohale's Hoek"]
            },
            {
              "name": "Butha-Buthe",
              "cities": ["Butha-Buthe", "Hlotse", "Maputsoe"]
            },
            {
              "name": "Leribe",
              "cities": ["Hlotse", "Maputsoe", "Teyateyaneng"]
            },
            {
              "name": "Mafeteng",
              "cities": ["Mafeteng", "Quthing", "Mohale's Hoek"]
            },
            {
              "name": "Maseru",
              "cities": ["Maseru", "Teyateyaneng", "Maputsoe"]
            },
            {
              "name": "Mohale's Hoek",
              "cities": ["Mohale's Hoek", "Quthing", "Mafeteng"]
            },
            {
              "name": "Mokhotlong",
              "cities": ["Mokhotlong", "Thaba-Tseka", "Qacha's Nek"]
            },
            {
              "name": "Qacha's Nek",
              "cities": ["Qacha's Nek", "Mokhotlong", "Thaba-Tseka"]
            },
            {
              "name": "Quthing",
              "cities": ["Quthing", "Mohale's Hoek", "Mafeteng"]
            },
            {
              "name": "Thaba-Tseka",
              "cities": ["Thaba-Tseka", "Mokhotlong", "Qacha's Nek"]
            }
          ]
        },
        {
          "country": "Liberia",
          "states": [
            {
              "name": "Bomi",
              "cities": ["Tubmanburg", "Klay", "Senjeh"]
            },
            {
              "name": "Bong",
              "cities": ["Gbarnga", "Sanoyea", "Suakoko"]
            },
            {
              "name": "Gbarpolu",
              "cities": ["Bopolu", "Totoquelleh", "Kongba"]
            },
            {
              "name": "Grand Bassa",
              "cities": ["Buchanan", "Edina", "Upper Buchanan"]
            },
            {
              "name": "Grand Cape Mount",
              "cities": ["Robertsport", "Tewor", "Bo Waterside"]
            },
            {
              "name": "Grand Gedeh",
              "cities": ["Zwedru", "Tchien", "Toe Town"]
            },
            {
              "name": "Grand Kru",
              "cities": ["Barclayville", "Bleebo", "Belle Yalla"]
            },
            {
              "name": "Lofa",
              "cities": ["Voinjama", "Zorzor", "Foya"]
            },
            {
              "name": "Margibi",
              "cities": ["Kakata", "Marshall", "Firestone"]
            },
            {
              "name": "Maryland",
              "cities": ["Harper", "Pleebo", "Karloken"]
            },
            {
              "name": "Montserrado",
              "cities": ["Monrovia", "Bensonville", "Careysburg"]
            },
            {
              "name": "Nimba",
              "cities": ["Sanniquellie", "Ganta", "Yekepa"]
            },
            {
              "name": "River Cess",
              "cities": ["Cestos City", "Bearwor", "Central Cess"]
            },
            {
              "name": "River Gee",
              "cities": ["Fish Town", "Kanweaken", "Webbo"]
            },
            {
              "name": "Sinoe",
              "cities": ["Greenville", "Buchanan", "Tubmanburg"]
            }
          ]
        },
        {
          "country": "Libya",
          "states": [
            {
              "name": "Ajdabiya",
              "cities": ["Ajdabiya", "Zuetina", "Awjila"]
            },
            {
              "name": "Al 'Aziziyah",
              "cities": ["Al 'Aziziyah", "Abu Ghrayn", "Qaryat al Qabil"]
            },
            {
              "name": "Al Fatih",
              "cities": ["Misrata", "Zliten", "Bani Walid"]
            },
            {
              "name": "Al Jabal al Akhdar",
              "cities": ["Bayda", "Shahat", "Al Qubah"]
            },
            {
              "name": "Al Jufrah",
              "cities": ["Hun", "Waddan", "Sokna"]
            },
            {
              "name": "Al Khums",
              "cities": ["Khoms", "Zletin", "Al Kararim"]
            },
            {
              "name": "Al Kufrah",
              "cities": ["Al Jawf", "Tazirbu", "Al Kufrah"]
            },
            {
              "name": "An Nuqat al Khams",
              "cities": ["Zuwara", "Al Maya", "Al Ajaylat"]
            },
            {
              "name": "Ash Shati'",
              "cities": ["Brak", "Ubari", "Ghat"]
            },
            {
              "name": "Awbari",
              "cities": ["Awbari", "Ghat", "Ubari"]
            },
            {
              "name": "Az Zawiyah",
              "cities": ["Zawiya", "Sabratha", "Surman"]
            },
            {
              "name": "Banghazi",
              "cities": ["Benghazi", "Al Marj", "Tocra"]
            },
            {
              "name": "Darnah",
              "cities": ["Derna", "Al Qubbah", "Ras al Helal"]
            },
            {
              "name": "Ghadamis",
              "cities": ["Ghadamis", "Nalut", "Al Ghazaya"]
            },
            {
              "name": "Gharyan",
              "cities": ["Gharyan", "Al Asabah", "Yafran"]
            },
            {
              "name": "Misratah",
              "cities": ["Misrata", "Tawergha", "Zliten"]
            },
            {
              "name": "Murzuq",
              "cities": ["Murzuq", "Al Wigh", "Tajarhi"]
            },
            {
              "name": "Sabha",
              "cities": ["Sabha", "Al Jufra", "Brak"]
            },
            {
              "name": "Sawfajjin",
              "cities": ["Sawfajjin", "Bani Walid", "Tarhuna"]
            },
            {
              "name": "Surt",
              "cities": ["Sirte", "Abu Qurayn", "Harawa"]
            },
            {
              "name": "Tarabulus",
              "cities": ["Tripoli", "Tajura", "Al Maya"]
            },
            {
              "name": "Tarhunah",
              "cities": ["Tarhuna", "Al Khums", "Msallata"]
            },
            {
              "name": "Tubruq",
              "cities": ["Tobruk", "Bardia", "Al Adm"]
            },
            {
              "name": "Yafran",
              "cities": ["Yafran", "Al Qalaa", "Al Ghazaya"]
            },
            {
              "name": "Zlitan",
              "cities": ["Zliten", "Misrata", "Tawergha"]
            }
          ]
        },
        {
          "country": "Liechtenstein",
          "states": [
            {
              "name": "Balzers",
              "cities": ["Balzers"]
            },
            {
              "name": "Eschen",
              "cities": ["Eschen", "Nendeln"]
            },
            {
              "name": "Gamprin",
              "cities": ["Gamprin", "Bendern"]
            },
            {
              "name": "Mauren",
              "cities": ["Mauren", "Schaanwald"]
            },
            {
              "name": "Planken",
              "cities": ["Planken"]
            },
            {
              "name": "Ruggell",
              "cities": ["Ruggell"]
            },
            {
              "name": "Schaan",
              "cities": ["Schaan"]
            },
            {
              "name": "Schellenberg",
              "cities": ["Schellenberg"]
            },
            {
              "name": "Triesen",
              "cities": ["Triesen"]
            },
            {
              "name": "Triesenberg",
              "cities": ["Triesenberg", "Masescha"]
            },
            {
              "name": "Vaduz",
              "cities": ["Vaduz"]
            }
          ]
        },
        {
          "country": "Lithuania",
          "states": [
            {
              "name": "Alytaus",
              "cities": ["Alytus", "Daugai", "Druskininkai"]
            },
            {
              "name": "Kauno",
              "cities": ["Kaunas", "Jonava", "Kedainiai"]
            },
            {
              "name": "Klaipedos",
              "cities": ["Klaipeda", "Silute", "Kretinga"]
            },
            {
              "name": "Marijampoles",
              "cities": ["Marijampole", "Vilkaviskis", "Kazlu Ruda"]
            },
            {
              "name": "Panevezio",
              "cities": ["Panevezys", "Ramygala", "Pasvalys"]
            },
            {
              "name": "Siauliu",
              "cities": ["Siauliai", "Radviliskis", "Kursenai"]
            },
            {
              "name": "Taurages",
              "cities": ["Taurage", "Skaudvile", "Jurbarkas"]
            },
            {
              "name": "Telsiu",
              "cities": ["Telsiai", "Mazeikiai", "Plunge"]
            },
            {
              "name": "Utenos",
              "cities": ["Utena", "Visaginas", "Anyksciai"]
            },
            {
              "name": "Vilniaus",
              "cities": ["Vilnius", "Trakai", "Elektrėnai"]
            }
          ]
        },
        {
          "country": "Luxembourg",
          "states": [
            {
              "name": "Diekirch",
              "cities": ["Diekirch", "Ettelbruck", "Vianden"]
            },
            {
              "name": "Grevenmacher",
              "cities": ["Grevenmacher", "Echternach", "Wormeldange"]
            },
            {
              "name": "Luxembourg",
              "cities": ["Luxembourg City", "Esch-sur-Alzette", "Dudelange"]
            }
          ]
        },
        {
          "country": "Macedonia",
          "states": [
            {
              "name": "Aerodrom",
              "cities": ["Skopje"]
            },
            {
              "name": "Aracinovo",
              "cities": ["Aracinovo"]
            },
            {
              "name": "Berovo",
              "cities": ["Berovo"]
            },
            {
              "name": "Bitola",
              "cities": ["Bitola"]
            },
            {
              "name": "Bogdanci",
              "cities": ["Bogdanci"]
            },
            {
              "name": "Bogovinje",
              "cities": ["Bogovinje"]
            },
            {
              "name": "Bosilovo",
              "cities": ["Bosilovo"]
            },
            {
              "name": "Brvenica",
              "cities": ["Brvenica"]
            },
            {
              "name": "Butel",
              "cities": ["Skopje"]
            },
            {
              "name": "Cair",
              "cities": ["Skopje"]
            },
            {
              "name": "Caska",
              "cities": ["Caska"]
            },
            {
              "name": "Centar",
              "cities": ["Skopje"]
            },
            {
              "name": "Centar Zupa",
              "cities": ["Centar Zupa"]
            },
            {
              "name": "Cesinovo",
              "cities": ["Cesinovo"]
            },
            {
              "name": "Cucer-Sandevo",
              "cities": ["Cucer-Sandevo"]
            },
            {
              "name": "Debar",
              "cities": ["Debar"]
            },
            {
              "name": "Debartsa",
              "cities": ["Debartsa"]
            },
            {
              "name": "Delcevo",
              "cities": ["Delcevo"]
            },
            {
              "name": "Demir Hisar",
              "cities": ["Demir Hisar"]
            },
            {
              "name": "Demir Kapija",
              "cities": ["Demir Kapija"]
            },
            {
              "name": "Dojran",
              "cities": ["Dojran"]
            },
            {
              "name": "Dolneni",
              "cities": ["Dolneni"]
            },
            {
              "name": "Drugovo",
              "cities": ["Drugovo"]
            },
            {
              "name": "Gazi Baba",
              "cities": ["Skopje"]
            },
            {
              "name": "Gevgelija",
              "cities": ["Gevgelija"]
            },
            {
              "name": "Gjorce Petrov",
              "cities": ["Skopje"]
            },
            {
              "name": "Gostivar",
              "cities": ["Gostivar"]
            },
            {
              "name": "Gradsko",
              "cities": ["Gradsko"]
            },
            {
              "name": "Ilinden",
              "cities": ["Ilinden"]
            },
            {
              "name": "Jegunovce",
              "cities": ["Jegunovce"]
            },
            {
              "name": "Karbinci",
              "cities": ["Karbinci"]
            },
            {
              "name": "Karpos",
              "cities": ["Skopje"]
            },
            {
              "name": "Kavadarci",
              "cities": ["Kavadarci"]
            },
            {
              "name": "Kicevo",
              "cities": ["Kicevo"]
            },
            {
              "name": "Kisela Voda",
              "cities": ["Skopje"]
            },
            {
              "name": "Kocani",
              "cities": ["Kocani"]
            },
            {
              "name": "Konce",
              "cities": ["Konce"]
            },
            {
              "name": "Kratovo",
              "cities": ["Kratovo"]
            },
            {
              "name": "Kriva Palanka",
              "cities": ["Kriva Palanka"]
            },
            {
              "name": "Krivogastani",
              "cities": ["Krivogastani"]
            },
            {
              "name": "Krusevo",
              "cities": ["Krusevo"]
            },
            {
              "name": "Kumanovo",
              "cities": ["Kumanovo"]
            },
            {
              "name": "Lipkovo",
              "cities": ["Lipkovo"]
            },
            {
              "name": "Lozovo",
              "cities": ["Lozovo"]
            },
            {
              "name": "Makedonska Kamenica",
              "cities": ["Makedonska Kamenica"]
            },
            {
              "name": "Makedonski Brod",
              "cities": ["Makedonski Brod"]
            },
            {
              "name": "Mavrovo i Rastusa",
              "cities": ["Mavrovo", "Rastusa"]
            },
            {
              "name": "Mogila",
              "cities": ["Mogila"]
            },
            {
              "name": "Negotino",
              "cities": ["Negotino"]
            },
            {
              "name": "Novaci",
              "cities": ["Novaci"]
            },
            {
              "name": "Novo Selo",
              "cities": ["Novo Selo"]
            },
            {
              "name": "Ohrid",
              "cities": ["Ohrid"]
            },
            {
              "name": "Oslomej",
              "cities": ["Oslomej"]
            },
            {
              "name": "Pehcevo",
              "cities": ["Pehcevo"]
            },
            {
              "name": "Petrovec",
              "cities": ["Petrovec"]
            },
            {
              "name": "Plasnica",
              "cities": ["Plasnica"]
            },
            {
              "name": "Prilep",
              "cities": ["Prilep"]
            },
            {
              "name": "Probistip",
              "cities": ["Probistip"]
            },
            {
              "name": "Radovis",
              "cities": ["Radovis"]
            },
            {
              "name": "Rankovce",
              "cities": ["Rankovce"]
            },
            {
              "name": "Resen",
              "cities": ["Resen"]
            },
            {
              "name": "Rosoman",
              "cities": ["Rosoman"]
            },
            {
              "name": "Saraj",
              "cities": ["Saraj"]
            },
            {
              "name": "Skopje",
              "cities": ["Skopje"]
            },
            {
              "name": "Sopiste",
              "cities": ["Sopiste"]
            },
            {
              "name": "Staro Nagoricane",
              "cities": ["Staro Nagoricane"]
            },
            {
              "name": "Stip",
              "cities": ["Stip"]
            },
            {
              "name": "Struga",
              "cities": ["Struga"]
            },
            {
              "name": "Strumica",
              "cities": ["Strumica"]
            },
            {
              "name": "Studenicani",
              "cities": ["Studenicani"]
            },
            {
              "name": "Suto Orizari",
              "cities": ["Skopje"]
            },
            {
              "name": "Sveti Nikole",
              "cities": ["Sveti Nikole"]
            },
            {
              "name": "Tearce",
              "cities": ["Tearce"]
            },
            {
              "name": "Tetovo",
              "cities": ["Tetovo"]
            },
            {
              "name": "Valandovo",
              "cities": ["Valandovo"]
            },
            {
              "name": "Vasilevo",
              "cities": ["Vasilevo"]
            },
            {
              "name": "Veles",
              "cities": ["Veles"]
            },
            {
              "name": "Vevcani",
              "cities": ["Vevcani"]
            },
            {
              "name": "Vinica",
              "cities": ["Vinica"]
            },
            {
              "name": "Vranestica",
              "cities": ["Vranestica"]
            },
            {
              "name": "Vrapciste",
              "cities": ["Vrapciste"]
            },
            {
              "name": "Zajas",
              "cities": ["Zajas"]
            },
            {
              "name": "Zelenikovo",
              "cities": ["Zelenikovo"]
            },
            {
              "name": "Zelino",
              "cities": ["Zelino"]
            },
            {
              "name": "Zrnovci",
              "cities": ["Zrnovci"]
            }
          ]
        },
        {
          "country": "Madagascar",
          "states": [
            {
              "name": "Antananarivo",
              "cities": ["Antananarivo", "Ambohidratrimo", "Antsirabe"]
            },
            {
              "name": "Antsiranana",
              "cities": ["Antsiranana", "Ambilobe", "Nosy Be"]
            },
            {
              "name": "Fianarantsoa",
              "cities": ["Fianarantsoa", "Manakara", "Ambalavao"]
            },
            {
              "name": "Mahajanga",
              "cities": ["Mahajanga", "Marovoay", "Soalala"]
            },
            {
              "name": "Toamasina",
              "cities": ["Toamasina", "Fenoarivo Atsinanana", "Mahanoro"]
            },
            {
              "name": "Toliara",
              "cities": ["Toliara", "Tolanaro", "Morondava"]
            }
          ]
        },
        {
          "country": "Malawi",
          "states": [
            {
              "name": "Balaka",
              "cities": ["Balaka", "Ntonda", "Phimbi"]
            },
            {
              "name": "Blantyre",
              "cities": ["Blantyre", "Limbe", "Chirimba"]
            },
            {
              "name": "Chikwawa",
              "cities": ["Chikwawa", "Ngabu", "Lengwe"]
            },
            {
              "name": "Chiradzulu",
              "cities": ["Chiradzulu", "Thumbwe", "Namitambo"]
            },
            {
              "name": "Chitipa",
              "cities": ["Chitipa", "Kameme", "Nthalire"]
            },
            {
              "name": "Dedza",
              "cities": ["Dedza", "Lobi", "Kaphuka"]
            },
            {
              "name": "Dowa",
              "cities": ["Dowa", "Mponela", "Chankhomi"]
            },
            {
              "name": "Karonga",
              "cities": ["Karonga", "Mwakaboko", "Kilupula"]
            },
            {
              "name": "Kasungu",
              "cities": ["Kasungu", "Lifidzi", "Chulu"]
            },
            {
              "name": "Likoma",
              "cities": ["Likoma", "Chizumulu"]
            },
            {
              "name": "Lilongwe",
              "cities": ["Lilongwe", "Area 25", "Mtandire"]
            },
            {
              "name": "Machinga",
              "cities": ["Machinga", "Liwonde", "Ntaja"]
            },
            {
              "name": "Mangochi",
              "cities": ["Mangochi", "Monkey Bay", "Chipoka"]
            },
            {
              "name": "Mchinji",
              "cities": ["Mchinji", "Kapiri", "Tembwe"]
            },
            {
              "name": "Mulanje",
              "cities": ["Mulanje", "Chitakale", "Phalombe"]
            },
            {
              "name": "Mwanza",
              "cities": ["Mwanza", "Neno", "Thambani"]
            },
            {
              "name": "Mzimba",
              "cities": ["Mzimba", "Ekwendeni", "Jenda"]
            },
            {
              "name": "Ntcheu",
              "cities": ["Ntcheu", "Bilira", "Tsangano"]
            },
            {
              "name": "Nkhata Bay",
              "cities": ["Nkhata Bay", "Chintheche", "Mzuzu"]
            },
            {
              "name": "Nkhotakota",
              "cities": ["Nkhotakota", "Dwangwa", "Mkango"]
            },
            {
              "name": "Nsanje",
              "cities": ["Nsanje", "Bangula", "Marka"]
            },
            {
              "name": "Ntchisi",
              "cities": ["Ntchisi", "Kasakula", "Chilooko"]
            },
            {
              "name": "Phalombe",
              "cities": ["Phalombe", "Mikolongwe", "Nambazo"]
            },
            {
              "name": "Rumphi",
              "cities": ["Rumphi", "Chitimba", "Hewe"]
            },
            {
              "name": "Salima",
              "cities": ["Salima", "Senga Bay", "Kambwiri"]
            },
            {
              "name": "Thyolo",
              "cities": ["Thyolo", "Makwasa", "Luchenza"]
            },
            {
              "name": "Zomba",
              "cities": ["Zomba", "Malosa", "Chingale"]
            }
          ]
        },
        {
          "country": "Malaysia",
          "states": [
            {
              "name": "Johor",
              "cities": ["Johor Bahru", "Pasir Gudang", "Muar"]
            },
            {
              "name": "Kedah",
              "cities": ["Alor Setar", "Sungai Petani", "Langkawi"]
            },
            {
              "name": "Kelantan",
              "cities": ["Kota Bharu", "Pasir Mas", "Tumpat"]
            },
            {
              "name": "Kuala Lumpur",
              "cities": ["Kuala Lumpur"]
            },
            {
              "name": "Labuan",
              "cities": ["Labuan"]
            },
            {
              "name": "Malacca",
              "cities": ["Malacca City", "Alor Gajah", "Jasin"]
            },
            {
              "name": "Negeri Sembilan",
              "cities": ["Seremban", "Nilai", "Port Dickson"]
            },
            {
              "name": "Pahang",
              "cities": ["Kuantan", "Temerloh", "Bentong"]
            },
            {
              "name": "Perak",
              "cities": ["Ipoh", "Taiping", "Teluk Intan"]
            },
            {
              "name": "Perlis",
              "cities": ["Kangar", "Arau", "Padang Besar"]
            },
            {
              "name": "Penang",
              "cities": ["George Town", "Butterworth", "Bukit Mertajam"]
            },
            {
              "name": "Sabah",
              "cities": ["Kota Kinabalu", "Sandakan", "Tawau"]
            },
            {
              "name": "Sarawak",
              "cities": ["Kuching", "Miri", "Sibu"]
            },
            {
              "name": "Selangor",
              "cities": ["Shah Alam", "Petaling Jaya", "Klang"]
            },
            {
              "name": "Terengganu",
              "cities": ["Kuala Terengganu", "Dungun", "Kemaman"]
            }
          ]
        },
        {
          "country": "Maldives",
          "states": [
            {
              "name": "Alifu",
              "cities": ["Mahibadhoo", "Dhangethi", "Dhiddhoo"]
            },
            {
              "name": "Baa",
              "cities": ["Eydhafushi", "Thulhaadhoo", "Kendhoo"]
            },
            {
              "name": "Dhaalu",
              "cities": ["Kudahuvadhoo", "Maaenboodhoo", "Hulhudheli"]
            },
            {
              "name": "Faafu",
              "cities": ["Nilandhoo", "Bileddhoo", "Magoodhoo"]
            },
            {
              "name": "Gaafu Alifu",
              "cities": ["Villingili", "Kolamaafushi", "Dhaandhoo"]
            },
            {
              "name": "Gaafu Dhaalu",
              "cities": ["Thinadhoo", "Madaveli", "Gadhdhoo"]
            },
            {
              "name": "Gnaviyani",
              "cities": ["Fuvahmulah"]
            },
            {
              "name": "Haa Alifu",
              "cities": ["Dhiddhoo", "Filladhoo", "Hoarafushi"]
            },
            {
              "name": "Haa Dhaalu",
              "cities": ["Kulhudhuffushi", "Nellaidhoo", "Naivaadhoo"]
            },
            {
              "name": "Kaafu",
              "cities": ["Male", "Hulhumale", "Thulusdhoo"]
            },
            {
              "name": "Laamu",
              "cities": ["Fonadhoo", "Gan", "Isdhoo"]
            },
            {
              "name": "Lhaviyani",
              "cities": ["Naifaru", "Hinnavaru", "Kurendhoo"]
            },
            {
              "name": "Maale",
              "cities": ["Male"]
            },
            {
              "name": "Meemu",
              "cities": ["Muli", "Kolhufushi", "Madifushi"]
            },
            {
              "name": "Noonu",
              "cities": ["Manadhoo", "Miladhoo", "Velidhoo"]
            },
            {
              "name": "Raa",
              "cities": ["Ungoofaaru", "Innamaadhoo", "Alifushi"]
            },
            {
              "name": "Seenu",
              "cities": ["Hithadhoo", "Feydhoo", "Maradhoo"]
            },
            {
              "name": "Shaviyani",
              "cities": ["Funadhoo", "Narudhoo", "Milandhoo"]
            },
            {
              "name": "Thaa",
              "cities": ["Veymandoo", "Buruni", "Madifushi"]
            },
            {
              "name": "Vaavu",
              "cities": ["Felidhoo", "Keyodhoo", "Rakeedhoo"]
            }
          ]
        },
        {
          "country": "Mali",
          "states": [
            {
              "name": "Bamako (Capital)",
              "cities": ["Bamako"]
            },
            {
              "name": "Gao",
              "cities": ["Gao", "Bourem", "Ansongo"]
            },
            {
              "name": "Kayes",
              "cities": ["Kayes", "Bafoulabe", "Kita"]
            },
            {
              "name": "Kidal",
              "cities": ["Kidal", "Abeibara", "Tessalit"]
            },
            {
              "name": "Koulikoro",
              "cities": ["Koulikoro", "Kati", "Banamba"]
            },
            {
              "name": "Mopti",
              "cities": ["Mopti", "Bandiagara", "Djenné"]
            },
            {
              "name": "Segou",
              "cities": ["Segou", "San", "Markala"]
            },
            {
              "name": "Sikasso",
              "cities": ["Sikasso", "Bougouni", "Koutiala"]
            },
            {
              "name": "Tombouctou",
              "cities": ["Timbuktu", "Goundam", "Diré"]
            }
          ]
        },
        {
          "country": "Malta",
          "states": []
        },
        {
          "country": "Marshall Islands",
          "states": []
        },
        {
          "country": "Mauritania",
          "states": [
            {
              "name": "Adrar",
              "cities": ["Atar", "Chinguetti", "Ouadane"]
            },
            {
              "name": "Assaba",
              "cities": ["Kiffa", "Guerou", "Barkewol"]
            },
            {
              "name": "Brakna",
              "cities": ["Aleg", "Boghe", "M'Bagne"]
            },
            {
              "name": "Dakhlet Nouadhibou",
              "cities": ["Nouadhibou", "Chami", "Cansado"]
            },
            {
              "name": "Gorgol",
              "cities": ["Kaédi", "Sélibaby", "M'Bout"]
            },
            {
              "name": "Guidimaka",
              "cities": ["Sélibaby", "Ould Yengé", "Bouanze"]
            },
            {
              "name": "Hodh Ech Chargui",
              "cities": ["Néma", "Oualata", "Timbedra"]
            },
            {
              "name": "Hodh El Gharbi",
              "cities": ["Ayoun el Atrous", "Koubenni", "Tintane"]
            },
            {
              "name": "Inchiri",
              "cities": ["Akjoujt", "Benichab", "Tmeimichatt"]
            },
            {
              "name": "Nouakchott",
              "cities": ["Nouakchott", "Tevragh Zeina", "El Mina"]
            },
            {
              "name": "Tagant",
              "cities": ["Tidjikja", "Tichit", "Moudjeria"]
            },
            {
              "name": "Tiris Zemmour",
              "cities": ["Zouerate", "Fderick", "Bir Moghrein"]
            },
            {
              "name": "Trarza",
              "cities": ["Rosso", "Boutilimit", "Mederdra"]
            }
          ]
        },
        {
          "country": "Mauritius",
          "states": [
            {
              "name": "Agalega Islands",
              "cities": ["Vingt Cinq", "La Fourche"]
            },
            {
              "name": "Black River",
              "cities": ["Bambous", "Tamarin", "Case Noyale"]
            },
            {
              "name": "Cargados Carajos Shoals",
              "cities": ["St. Brandon"]
            },
            {
              "name": "Flacq",
              "cities": ["Centre de Flacq", "Bel Air", "Quatre Cocos"]
            },
            {
              "name": "Grand Port",
              "cities": ["Mahébourg", "Rose Belle", "New Grove"]
            },
            {
              "name": "Moka",
              "cities": ["Moka", "Quartier Militaire", "St. Pierre"]
            },
            {
              "name": "Pamplemousses",
              "cities": ["Triolet", "Pamplemousses", "Trou aux Biches"]
            },
            {
              "name": "Plaines Wilhems",
              "cities": ["Beau Bassin-Rose Hill", "Quatre Bornes", "Vacoas"]
            },
            {
              "name": "Port Louis",
              "cities": ["Port Louis", "Curepipe", "Pailles"]
            },
            {
              "name": "Riviere du Rempart",
              "cities": ["Roches Noires", "Poste de Flacq", "Belle Mare"]
            },
            {
              "name": "Rodrigues",
              "cities": ["Port Mathurin", "Gabriel", "La Ferme"]
            },
            {
              "name": "Savanne",
              "cities": ["Souillac", "Rivière des Anguilles", "Bel Ombre"]
            }
          ]
        },
        {
          "country": "Mexico",
          "states": [
            {
              "name": "Aguascalientes",
              "cities": ["Aguascalientes", "Jesús María", "Calvillo"]
            },
            {
              "name": "Baja California",
              "cities": ["Tijuana", "Mexicali", "Ensenada"]
            },
            {
              "name": "Baja California Sur",
              "cities": ["La Paz", "Cabo San Lucas", "San José del Cabo"]
            },
            {
              "name": "Campeche",
              "cities": ["Campeche", "Ciudad del Carmen", "Champotón"]
            },
            {
              "name": "Chiapas",
              "cities": ["Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula"]
            },
            {
              "name": "Chihuahua",
              "cities": ["Chihuahua", "Juárez", "Cuauhtémoc"]
            },
            {
              "name": "Coahuila de Zaragoza",
              "cities": ["Saltillo", "Torreón", "Monclova"]
            },
            {
              "name": "Colima",
              "cities": ["Colima", "Manzanillo", "Tecomán"]
            },
            {
              "name": "Distrito Federal",
              "cities": ["Mexico City", "Coyoacán", "Iztapalapa"]
            },
            {
              "name": "Durango",
              "cities": ["Durango", "Gómez Palacio", "Lerdo"]
            },
            {
              "name": "Guanajuato",
              "cities": ["Guanajuato", "León", "Irapuato"]
            },
            {
              "name": "Guerrero",
              "cities": ["Acapulco", "Chilpancingo", "Iguala"]
            },
            {
              "name": "Hidalgo",
              "cities": ["Pachuca", "Tulancingo", "Tula de Allende"]
            },
            {
              "name": "Jalisco",
              "cities": ["Guadalajara", "Zapopan", "Tlaquepaque"]
            },
            {
              "name": "Mexico",
              "cities": ["Toluca", "Ecatepec", "Naucalpan"]
            },
            {
              "name": "Michoacan de Ocampo",
              "cities": ["Morelia", "Uruapan", "Zamora"]
            },
            {
              "name": "Morelos",
              "cities": ["Cuernavaca", "Jiutepec", "Cuautla"]
            },
            {
              "name": "Nayarit",
              "cities": ["Tepic", "Ixtlán del Río", "Santiago Ixcuintla"]
            },
            {
              "name": "Nuevo Leon",
              "cities": ["Monterrey", "Guadalupe", "San Nicolás de los Garza"]
            },
            {
              "name": "Oaxaca",
              "cities": ["Oaxaca", "Salina Cruz", "Juchitán de Zaragoza"]
            },
            {
              "name": "Puebla",
              "cities": ["Puebla", "Tehuacán", "San Martín Texmelucan"]
            },
            {
              "name": "Queretaro de Arteaga",
              "cities": ["Querétaro", "San Juan del Río", "Corregidora"]
            },
            {
              "name": "Quintana Roo",
              "cities": ["Cancún", "Chetumal", "Playa del Carmen"]
            },
            {
              "name": "San Luis Potosi",
              "cities": ["San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles"]
            },
            {
              "name": "Sinaloa",
              "cities": ["Culiacán", "Mazatlán", "Los Mochis"]
            },
            {
              "name": "Sonora",
              "cities": ["Hermosillo", "Ciudad Obregón", "Nogales"]
            },
            {
              "name": "Tabasco",
              "cities": ["Villahermosa", "Cárdenas", "Comalcalco"]
            },
            {
              "name": "Tamaulipas",
              "cities": ["Reynosa", "Matamoros", "Nuevo Laredo"]
            },
            {
              "name": "Tlaxcala",
              "cities": ["Tlaxcala", "Apizaco", "Chiautempan"]
            },
            {
              "name": "Veracruz-Llave",
              "cities": ["Veracruz", "Xalapa", "Coatzacoalcos"]
            },
            {
              "name": "Yucatan",
              "cities": ["Mérida", "Valladolid", "Tizimín"]
            },
            {
              "name": "Zacatecas",
              "cities": ["Zacatecas", "Fresnillo", "Guadalupe"]
            }
          ]
        },
        {
          "country": "Micronesia",
          "states": []
        },
        {
          "country": "Moldova",
          "states": [
            {
              "name": "Anenii Noi",
              "cities": ["Anenii Noi", "Varnița", "Chetrosu"]
            },
            {
              "name": "Basarabeasca",
              "cities": ["Basarabeasca", "Abaclia", "Iordanovca"]
            },
            {
              "name": "Briceni",
              "cities": ["Briceni", "Lipcani", "Balasinești"]
            },
            {
              "name": "Cahul",
              "cities": ["Cahul", "Giurgiulești", "Vadul lui Isac"]
            },
            {
              "name": "Cantemir",
              "cities": ["Cantemir", "Căușeni", "Leova"]
            },
            {
              "name": "Calarasi",
              "cities": ["Călărași", "Săseni", "Răciula"]
            },
            {
              "name": "Causeni",
              "cities": ["Căușeni", "Zaim", "Fârlădeni"]
            },
            {
              "name": "Cimislia",
              "cities": ["Cimișlia", "Iargara", "Bogdanovca"]
            },
            {
              "name": "Criuleni",
              "cities": ["Criuleni", "Bălți", "Ocnița"]
            },
            {
              "name": "Donduseni",
              "cities": ["Dondușeni", "Criuleni", "Briceni"]
            },
            {
              "name": "Drochia",
              "cities": ["Drochia", "Sofia", "Pervomaisc"]
            },
            {
              "name": "Dubasari",
              "cities": ["Dubăsari", "Cocieri", "Corjova"]
            },
            {
              "name": "Edinet",
              "cities": ["Edineț", "Briceni", "Ocnița"]
            },
            {
              "name": "Falesti",
              "cities": ["Fălești", "Glodeni", "Bălți"]
            },
            {
              "name": "Floresti",
              "cities": ["Florești", "Mărculești", "Ghindești"]
            },
            {
              "name": "Glodeni",
              "cities": ["Glodeni", "Bălți", "Fălești"]
            },
            {
              "name": "Hincesti",
              "cities": ["Hîncești", "Leova", "Cimișlia"]
            },
            {
              "name": "Ialoveni",
              "cities": ["Ialoveni", "Cărpineni", "Sîngera"]
            },
            {
              "name": "Leova",
              "cities": ["Leova", "Căușeni", "Hîncești"]
            },
            {
              "name": "Nisporeni",
              "cities": ["Nisporeni", "Sîngerei", "Bălți"]
            },
            {
              "name": "Ocnita",
              "cities": ["Ocnița", "Briceni", "Edineț"]
            },
            {
              "name": "Orhei",
              "cities": ["Orhei", "Criuleni", "Rezina"]
            },
            {
              "name": "Rezina",
              "cities": ["Rezina", "Orhei", "Criuleni"]
            },
            {
              "name": "Riscani",
              "cities": ["Rîșcani", "Bălți", "Glodeni"]
            },
            {
              "name": "Singerei",
              "cities": ["Sîngerei", "Bălți", "Florești"]
            },
            {
              "name": "Soldanesti",
              "cities": ["Șoldănești", "Rezina", "Orhei"]
            },
            {
              "name": "Soroca",
              "cities": ["Soroca", "Bălți", "Florești"]
            },
            {
              "name": "Stefan-Voda",
              "cities": ["Ștefan Vodă", "Căușeni", "Slobozia"]
            },
            {
              "name": "Straseni",
              "cities": ["Strășeni", "Orhei", "Criuleni"]
            },
            {
              "name": "Taraclia",
              "cities": ["Taraclia", "Cahul", "Ceadîr-Lunga"]
            },
            {
              "name": "Telenesti",
              "cities": ["Telenești", "Orhei", "Rezina"]
            },
            {
              "name": "Ungheni",
              "cities": ["Ungheni", "Nisporeni", "Hîncești"]
            },
            {
              "name": "Balti",
              "cities": ["Bălți", "Fălești", "Glodeni"]
            },
            {
              "name": "Bender",
              "cities": ["Bender", "Tiraspol", "Rîbnița"]
            },
            {
              "name": "Chisinau",
              "cities": ["Chișinău", "Sîngera", "Vadul lui Vodă"]
            },
            {
              "name": "Gagauzia",
              "cities": ["Comrat", "Ceadîr-Lunga", "Vulcănești"]
            },
            {
              "name": "Stinga Nistrului",
              "cities": ["Tiraspol", "Bender", "Rîbnița"]
            }
          ]
        },
        {
          "country": "Mongolia",
          "states": [
            {
              "name": "Arhangay",
              "cities": ["Tsetserleg", "Ikh-Uul"]
            },
            {
              "name": "Bayanhongor",
              "cities": ["Bayanhongor", "Jinst", "Bayshilt"]
            },
            {
              "name": "Bayan-Olgiy",
              "cities": ["Olgiy"]
            },
            {
              "name": "Bulgan",
              "cities": ["Bulgan", "Khangai"]
            },
            {
              "name": "Darhan Uul",
              "cities": ["Darhan", "Jargalant"]
            },
            {
              "name": "Dornod",
              "cities": ["Choibalsan", "Dornod"]
            },
            {
              "name": "Dornogovi",
              "cities": ["Sainshand", "Dalanzadgad"]
            },
            {
              "name": "Dundgovi",
              "cities": ["Dundgovi", "Jinst"]
            },
            {
              "name": "Dzavhan",
              "cities": ["Zavkhan", "Uliastai"]
            },
            {
              "name": "Govi-Altay",
              "cities": ["Altai", "Erdent"]
            },
            {
              "name": "Govi-Sumber",
              "cities": ["Baganuur"]
            },
            {
              "name": "Hentiy",
              "cities": ["Choibalsan", "Erdene"]
            },
            {
              "name": "Hovd",
              "cities": ["Hovd", "Mongol-Us"]
            },
            {
              "name": "Hovsgol",
              "cities": ["Mörön", "Shine-Ider"]
            },
            {
              "name": "Omnogovi",
              "cities": ["Dalanzadgad", "Ömnögovi"]
            },
            {
              "name": "Orhon",
              "cities": ["Erdenet"]
            },
            {
              "name": "Ovorhangay",
              "cities": ["Zuunbayan"]
            },
            {
              "name": "Selenge",
              "cities": ["Sukhbaatar", "Darkhan"]
            },
            {
              "name": "Suhbaatar",
              "cities": ["Sukhbaatar"]
            },
            {
              "name": "Tov",
              "cities": ["Zuunmod"]
            },
            {
              "name": "Ulaanbaatar",
              "cities": ["Ulaanbaatar"]
            },
            {
              "name": "Uvs",
              "cities": ["Ulaangom"]
            }
          ]
        },
        {
          "country": "Morocco",
          "states": [
            {
              "name": "Agadir",
              "cities": ["Agadir", "Inezgane"]
            },
            {
              "name": "Al Hoceima",
              "cities": ["Al Hoceima", "Imzouren"]
            },
            {
              "name": "Azilal",
              "cities": ["Azilal", "Bni Mellal"]
            },
            {
              "name": "Beni Mellal",
              "cities": ["Beni Mellal", "Khouribga"]
            },
            {
              "name": "Ben Slimane",
              "cities": ["Ben Slimane", "Mohammadia"]
            },
            {
              "name": "Boulemane",
              "cities": ["Boulemane", "Meknes"]
            },
            {
              "name": "Casablanca",
              "cities": ["Casablanca"]
            },
            {
              "name": "Chaouen",
              "cities": ["Chefchaouen", "Akchour"]
            },
            {
              "name": "El Jadida",
              "cities": ["El Jadida", "Azemmour"]
            },
            {
              "name": "El Kelaa des Sraghna",
              "cities": ["El Kelaa des Sraghna"]
            },
            {
              "name": "Er Rachidia",
              "cities": ["Er Rachidia", "Midelt"]
            },
            {
              "name": "Essaouira",
              "cities": ["Essaouira", "Mogador"]
            },
            {
              "name": "Fes",
              "cities": ["Fes", "Ifrane"]
            },
            {
              "name": "Figuig",
              "cities": ["Figuig"]
            },
            {
              "name": "Guelmim",
              "cities": ["Guelmim", "Tan-Tan"]
            },
            {
              "name": "Ifrane",
              "cities": ["Ifrane"]
            },
            {
              "name": "Kenitra",
              "cities": ["Kenitra", "Sidi Kacem"]
            },
            {
              "name": "Khemisset",
              "cities": ["Khemisset"]
            },
            {
              "name": "Khenifra",
              "cities": ["Khenifra", "Beni Mellal"]
            },
            {
              "name": "Khouribga",
              "cities": ["Khouribga"]
            },
            {
              "name": "Laayoune",
              "cities": ["Laayoune"]
            },
            {
              "name": "Larache",
              "cities": ["Larache", "Asilah"]
            },
            {
              "name": "Marrakech",
              "cities": ["Marrakech", "Essaouira"]
            },
            {
              "name": "Meknes",
              "cities": ["Meknes"]
            },
            {
              "name": "Nador",
              "cities": ["Nador"]
            },
            {
              "name": "Ouarzazate",
              "cities": ["Ouarzazate"]
            },
            {
              "name": "Oujda",
              "cities": ["Oujda"]
            },
            {
              "name": "Rabat-Sale",
              "cities": ["Rabat", "Sale"]
            },
            {
              "name": "Safi",
              "cities": ["Safi"]
            },
            {
              "name": "Settat",
              "cities": ["Settat"]
            },
            {
              "name": "Sidi Kacem",
              "cities": ["Sidi Kacem"]
            },
            {
              "name": "Tangier",
              "cities": ["Tangier"]
            },
            {
              "name": "Tan-Tan",
              "cities": ["Tan-Tan"]
            },
            {
              "name": "Taounate",
              "cities": ["Taounate"]
            },
            {
              "name": "Taroudannt",
              "cities": ["Taroudannt"]
            },
            {
              "name": "Tata",
              "cities": ["Tata"]
            },
            {
              "name": "Taza",
              "cities": ["Taza"]
            },
            {
              "name": "Tetouan",
              "cities": ["Tetouan"]
            },
            {
              "name": "Tiznit",
              "cities": ["Tiznit"]
            }
          ]
        },
        {
          "country": "Monaco",
          "states": []
        },
        {
          "country": "Mozambique",
          "states": [
            {
              "name": "Cabo Delgado",
              "cities": ["Pemba", "Mueda"]
            },
            {
              "name": "Gaza",
              "cities": ["Xai-Xai", "Chókwè"]
            },
            {
              "name": "Inhambane",
              "cities": ["Inhambane", "Maxixe"]
            },
            {
              "name": "Manica",
              "cities": ["Chimoio", "Gorongosa"]
            },
            {
              "name": "Maputo",
              "cities": ["Maputo", "Matola"]
            },
            {
              "name": "Cidade de Maputo",
              "cities": ["Maputo"]
            },
            {
              "name": "Nampula",
              "cities": ["Nampula", "Monapo"]
            },
            {
              "name": "Niassa",
              "cities": ["Lichinga", "Cuamba"]
            },
            {
              "name": "Sofala",
              "cities": ["Beira", "Dondo"]
            },
            {
              "name": "Tete",
              "cities": ["Tete", "Zumbo"]
            },
            {
              "name": "Zambezia",
              "cities": ["Quelimane", "Chinde"]
            }
          ]
        },
        {
          "country": "Namibia",
          "states": [
            {
              "name": "Caprivi",
              "cities": ["Katima Mulilo", "Ngoma"]
            },
            {
              "name": "Erongo",
              "cities": ["Swakopmund", "Walvis Bay"]
            },
            {
              "name": "Hardap",
              "cities": ["Mariental", "Rehoboth"]
            },
            {
              "name": "Karas",
              "cities": ["Keetmanshoop", "Lüderitz"]
            },
            {
              "name": "Khomas",
              "cities": ["Windhoek", "Okahandja"]
            },
            {
              "name": "Kunene",
              "cities": ["Opuwo", "Outjo"]
            },
            {
              "name": "Ohangwena",
              "cities": ["Oshikango", "Eenhana"]
            },
            {
              "name": "Okavango",
              "cities": ["Rundu", "Nkurenkuru"]
            },
            {
              "name": "Omaheke",
              "cities": ["Gobabis", "Witvlei"]
            },
            {
              "name": "Omusati",
              "cities": ["Outapi", "Oshikuku"]
            },
            {
              "name": "Oshana",
              "cities": ["Oshakati", "Ondangwa"]
            },
            {
              "name": "Oshikoto",
              "cities": ["Tsumeb", "Omuthiya"]
            },
            {
              "name": "Otjozondjupa",
              "cities": ["Otjiwarongo", "Grootfontein"]
            }
          ]
        },
        {
          "country": "Nauru",
          "states": []
        },
        {
          "country": "Nepal",
          "states": [
            {
              "name": "Bagmati",
              "cities": ["Kathmandu", "Bhaktapur"]
            },
            {
              "name": "Bheri",
              "cities": ["Nepalganj", "Gulariya"]
            },
            {
              "name": "Dhawalagiri",
              "cities": ["Baglung", "Beni"]
            },
            {
              "name": "Gandaki",
              "cities": ["Pokhara", "Gorkha"]
            },
            {
              "name": "Janakpur",
              "cities": ["Janakpur", "Jaleshwar"]
            },
            {
              "name": "Karnali",
              "cities": ["Surkhet", "Jumla"]
            },
            {
              "name": "Kosi",
              "cities": ["Biratnagar", "Dharan"]
            },
            {
              "name": "Lumbini",
              "cities": ["Lumbini", "Butwal"]
            },
            {
              "name": "Mahakali",
              "cities": ["Mahendranagar", "Darchula"]
            },
            {
              "name": "Mechi",
              "cities": ["Ilam", "Bhadrapur"]
            },
            {
              "name": "Narayani",
              "cities": ["Birgunj", "Hetauda"]
            },
            {
              "name": "Rapti",
              "cities": ["Tulsipur", "Ghorahi"]
            },
            {
              "name": "Sagarmatha",
              "cities": ["Rajbiraj", "Siraha"]
            },
            {
              "name": "Seti",
              "cities": ["Dipayal", "Dhangadhi"]
            }
          ]
        },
        {
          "country": "Netherlands",
          "states": [
            {
              "name": "Drenthe",
              "cities": ["Assen", "Emmen"]
            },
            {
              "name": "Flevoland",
              "cities": ["Almere", "Lelystad"]
            },
            {
              "name": "Friesland",
              "cities": ["Leeuwarden", "Sneek"]
            },
            {
              "name": "Gelderland",
              "cities": ["Arnhem", "Nijmegen"]
            },
            {
              "name": "Groningen",
              "cities": ["Groningen", "Delfzijl"]
            },
            {
              "name": "Limburg",
              "cities": ["Maastricht", "Heerlen"]
            },
            {
              "name": "Noord-Brabant",
              "cities": ["Eindhoven", "Breda"]
            },
            {
              "name": "Noord-Holland",
              "cities": ["Amsterdam", "Haarlem"]
            },
            {
              "name": "Overijssel",
              "cities": ["Enschede", "Zwolle"]
            },
            {
              "name": "Utrecht",
              "cities": ["Utrecht", "Amersfoort"]
            },
            {
              "name": "Zeeland",
              "cities": ["Middelburg", "Vlissingen"]
            },
            {
              "name": "Zuid-Holland",
              "cities": ["Rotterdam", "The Hague"]
            }
          ]
        },
        {
          "country": "New Zealand",
          "states": [
            {
              "name": "Auckland",
              "cities": ["Auckland", "North Shore"]
            },
            {
              "name": "Bay of Plenty",
              "cities": ["Tauranga", "Rotorua"]
            },
            {
              "name": "Canterbury",
              "cities": ["Christchurch", "Timaru"]
            },
            {
              "name": "Chatham Islands",
              "cities": ["Waitangi"]
            },
            {
              "name": "Gisborne",
              "cities": ["Gisborne"]
            },
            {
              "name": "Hawke's Bay",
              "cities": ["Napier", "Hastings"]
            },
            {
              "name": "Manawatu-Wanganui",
              "cities": ["Palmerston North", "Whanganui"]
            },
            {
              "name": "Marlborough",
              "cities": ["Blenheim", "Picton"]
            },
            {
              "name": "Nelson",
              "cities": ["Nelson"]
            },
            {
              "name": "Northland",
              "cities": ["Whangarei", "Dargaville"]
            },
            {
              "name": "Otago",
              "cities": ["Dunedin", "Queenstown"]
            },
            {
              "name": "Southland",
              "cities": ["Invercargill", "Gore"]
            },
            {
              "name": "Taranaki",
              "cities": ["New Plymouth", "Hawera"]
            },
            {
              "name": "Tasman",
              "cities": ["Richmond", "Motueka"]
            },
            {
              "name": "Waikato",
              "cities": ["Hamilton", "Cambridge"]
            },
            {
              "name": "Wellington",
              "cities": ["Wellington", "Lower Hutt"]
            },
            {
              "name": "West Coast",
              "cities": ["Greymouth", "Westport"]
            }
          ]
        },
        {
          "country": "Nicaragua",
          "states": [
            {
              "name": "Atlantico Norte",
              "cities": ["Puerto Cabezas", "Waspam"]
            },
            {
              "name": "Atlantico Sur",
              "cities": ["Bluefields", "San Juan del Norte"]
            },
            {
              "name": "Boaco",
              "cities": ["Boaco", "San José de los Remates"]
            },
            {
              "name": "Carazo",
              "cities": ["Diriamba", "Jinotepe"]
            },
            {
              "name": "Chinandega",
              "cities": ["Chinandega", "Corinto"]
            },
            {
              "name": "Chontales",
              "cities": ["Juigalpa", "La Libertad"]
            },
            {
              "name": "Esteli",
              "cities": ["Esteli", "Condega"]
            },
            {
              "name": "Granada",
              "cities": ["Granada", "Nandaime"]
            },
            {
              "name": "Jinotega",
              "cities": ["Jinotega", "La Dalia"]
            },
            {
              "name": "Leon",
              "cities": ["Leon", "Chichigalpa"]
            },
            {
              "name": "Madriz",
              "cities": ["Somoto", "San Juan de Rio Coco"]
            },
            {
              "name": "Managua",
              "cities": ["Managua", "Ciudad Sandino"]
            },
            {
              "name": "Masaya",
              "cities": ["Masaya", "Nindirí"]
            },
            {
              "name": "Matagalpa",
              "cities": ["Matagalpa", "La Dalia"]
            },
            {
              "name": "Nueva Segovia",
              "cities": ["Ocotal", "El Jicaro"]
            },
            {
              "name": "Rio San Juan",
              "cities": ["San Carlos", "El Castillo"]
            },
            {
              "name": "Rivas",
              "cities": ["Rivas", "San Jorge"]
            }
          ]
        },
        {
          "country": "Niger",
          "states": [
            {
              "name": "Agadez",
              "cities": ["Agadez", "Arlit"]
            },
            {
              "name": "Diffa",
              "cities": ["Diffa", "N'guigmi"]
            },
            {
              "name": "Dosso",
              "cities": ["Dosso", "Gaya"]
            },
            {
              "name": "Maradi",
              "cities": ["Maradi", "Tessaoua"]
            },
            {
              "name": "Niamey",
              "cities": ["Niamey"]
            },
            {
              "name": "Tahoua",
              "cities": ["Tahoua", "Aderbissinat"]
            },
            {
              "name": "Tillaberi",
              "cities": ["Tillaberi", "Ouallam"]
            },
            {
              "name": "Zinder",
              "cities": ["Zinder", "Tchirozerine"]
            }
          ]
        },
        {
          "country": "Nigeria",
          "states": [
            {
              "name": "Abia",
              "cities": ["Umuahia", "Aba"]
            },
            {
              "name": "Abuja Federal Capital",
              "cities": ["Abuja"]
            },
            {
              "name": "Adamawa",
              "cities": ["Yola", "Mubi"]
            },
            {
              "name": "Akwa Ibom",
              "cities": ["Uyo", "Eket"]
            },
            {
              "name": "Anambra",
              "cities": ["Awka", "Onitsha"]
            },
            {
              "name": "Bauchi",
              "cities": ["Bauchi", "Azare"]
            },
            {
              "name": "Bayelsa",
              "cities": ["Yenagoa", "Brass"]
            },
            {
              "name": "Benue",
              "cities": ["Makurdi", "Gboko"]
            },
            {
              "name": "Borno",
              "cities": ["Maiduguri", "Bama"]
            },
            {
              "name": "Cross River",
              "cities": ["Calabar", "Ugep"]
            },
            {
              "name": "Delta",
              "cities": ["Asaba", "Warri"]
            },
            {
              "name": "Ebonyi",
              "cities": ["Abakaliki", "Afikpo"]
            },
            {
              "name": "Edo",
              "cities": ["Benin City", "Auchi"]
            },
            {
              "name": "Ekiti",
              "cities": ["Ado Ekiti", "Ikere"]
            },
            {
              "name": "Enugu",
              "cities": ["Enugu", "Nsukka"]
            },
            {
              "name": "Gombe",
              "cities": ["Gombe", "Bajoga"]
            },
            {
              "name": "Imo",
              "cities": ["Owerri", "Orlu"]
            },
            {
              "name": "Jigawa",
              "cities": ["Dutse", "Hadejia"]
            },
            {
              "name": "Kaduna",
              "cities": ["Kaduna", "Zaria"]
            },
            {
              "name": "Kano",
              "cities": ["Kano", "Dawakin Kudu"]
            },
            {
              "name": "Katsina",
              "cities": ["Katsina", "Daura"]
            },
            {
              "name": "Kebbi",
              "cities": ["Birnin Kebbi", "Argungu"]
            },
            {
              "name": "Kogi",
              "cities": ["Lokoja", "Okene"]
            },
            {
              "name": "Kwara",
              "cities": ["Ilorin", "Offa"]
            },
            {
              "name": "Lagos",
              "cities": ["Lagos", "Ikeja"]
            },
            {
              "name": "Nassarawa",
              "cities": ["Lafia", "Keffi"]
            },
            {
              "name": "Niger",
              "cities": ["Minna", "Bida"]
            },
            {
              "name": "Ogun",
              "cities": ["Abeokuta", "Ijebu Ode"]
            },
            {
              "name": "Ondo",
              "cities": ["Akure", "Ondo"]
            },
            {
              "name": "Osun",
              "cities": ["Osogbo", "Ile-Ife"]
            },
            {
              "name": "Oyo",
              "cities": ["Ibadan", "Ogbomosho"]
            },
            {
              "name": "Plateau",
              "cities": ["Jos", "Bukuru"]
            },
            {
              "name": "Rivers",
              "cities": ["Port Harcourt", "Bonny"]
            },
            {
              "name": "Sokoto",
              "cities": ["Sokoto", "Wamako"]
            },
            {
              "name": "Taraba",
              "cities": ["Jalingo", "Wukari"]
            },
            {
              "name": "Yobe",
              "cities": ["Damaturu", "Potiskum"]
            },
            {
              "name": "Zamfara",
              "cities": ["Gusau", "Kaura Namoda"]
            }
          ]
        },
        {
          "country": "Norway",
          "states": [
            {
              "name": "Akershus",
              "cities": ["Oslo", "Lillestrøm"]
            },
            {
              "name": "Aust-Agder",
              "cities": ["Arendal", "Grimstad"]
            },
            {
              "name": "Buskerud",
              "cities": ["Drammen", "Kongsberg"]
            },
            {
              "name": "Finnmark",
              "cities": ["Alta", "Vadsø"]
            },
            {
              "name": "Hedmark",
              "cities": ["Hamar", "Kongsvinger"]
            },
            {
              "name": "Hordaland",
              "cities": ["Bergen", "Leirvik"]
            },
            {
              "name": "More og Romsdal",
              "cities": ["Ålesund", "Molde"]
            },
            {
              "name": "Nordland",
              "cities": ["Bodø", "Narvik"]
            },
            {
              "name": "Nord-Trondelag",
              "cities": ["Steinkjer", "Levanger"]
            },
            {
              "name": "Oppland",
              "cities": ["Lillehammer", "Gjøvik"]
            },
            {
              "name": "Oslo",
              "cities": ["Oslo"]
            },
            {
              "name": "Ostfold",
              "cities": ["Sarpsborg", "Fredrikstad"]
            },
            {
              "name": "Rogaland",
              "cities": ["Stavanger", "Haugesund"]
            },
            {
              "name": "Sogn og Fjordane",
              "cities": ["Førde", "Florø"]
            },
            {
              "name": "Sor-Trondelag",
              "cities": ["Trondheim", "Melhus"]
            },
            {
              "name": "Telemark",
              "cities": ["Skien", "Porsgrunn"]
            },
            {
              "name": "Troms",
              "cities": ["Tromsø", "Harstad"]
            },
            {
              "name": "Vest-Agder",
              "cities": ["Kristiansand", "Mandal"]
            },
            {
              "name": "Vestfold",
              "cities": ["Tønsberg", "Sandefjord"]
            }
          ]
        },
        {
          "country": "Oman",
          "states": [
            {
              "name": "Ad Dakhiliyah",
              "cities": ["Nizwa", "Bahla"]
            },
            {
              "name": "Al Batinah",
              "cities": ["Sohar", "Rustaq"]
            },
            {
              "name": "Al Wusta",
              "cities": ["Haima", "Duqm"]
            },
            {
              "name": "Ash Sharqiyah",
              "cities": ["Sur", "Ibra"]
            },
            {
              "name": "Az Zahirah",
              "cities": ["Ibri", "Yanqul"]
            },
            {
              "name": "Masqat",
              "cities": ["Muscat", "Seeb"]
            },
            {
              "name": "Musandam",
              "cities": ["Khasab", "Dibba"]
            },
            {
              "name": "Dhofar",
              "cities": ["Salalah", "Mirbat"]
            }
          ]
        },
        {
          "country": "Pakistan",
          "states": [
            {
              "name": "Balochistan",
              "cities": ["Quetta", "Turbat"]
            },
            {
              "name": "North-West Frontier Province",
              "cities": ["Peshawar", "Mardan"]
            },
            {
              "name": "Punjab",
              "cities": ["Lahore", "Multan"]
            },
            {
              "name": "Sindh",
              "cities": ["Karachi", "Hyderabad"]
            },
            {
              "name": "Islamabad Capital Territory",
              "cities": ["Islamabad"]
            },
            {
              "name": "Federally Administered Tribal Areas",
              "cities": ["Bajaur", "Kurram"]
            }
          ]
        },
        {
          "country": "Panama",
          "states": [
            {
              "name": "Bocas del Toro",
              "cities": ["Bocas del Toro", "Changuinola"]
            },
            {
              "name": "Chiriqui",
              "cities": ["David", "Boquete"]
            },
            {
              "name": "Cocle",
              "cities": ["Penonome", "La Pintada"]
            },
            {
              "name": "Colon",
              "cities": ["Colon", "Sabanitas"]
            },
            {
              "name": "Darien",
              "cities": ["La Palma", "Meteti"]
            },
            {
              "name": "Herrera",
              "cities": ["Chitre", "Parita"]
            },
            {
              "name": "Los Santos",
              "cities": ["Las Tablas", "Pedasi"]
            },
            {
              "name": "Panama",
              "cities": ["Panama City", "San Miguelito"]
            },
            {
              "name": "San Blas",
              "cities": ["El Porvenir", "Corazon de Jesus"]
            },
            {
              "name": "Veraguas",
              "cities": ["Santiago", "Soná"]
            }
          ]
        },
        {
          "country": "Papua New Guinea",
          "states": [
            {
              "name": "Bougainville",
              "cities": ["Buka", "Arawa"]
            },
            {
              "name": "Central",
              "cities": ["Port Moresby", "Kairuku"]
            },
            {
              "name": "Chimbu",
              "cities": ["Kundiawa", "Gembogl"]
            },
            {
              "name": "Eastern Highlands",
              "cities": ["Goroka", "Kainantu"]
            },
            {
              "name": "East New Britain",
              "cities": ["Rabaul", "Kokopo"]
            },
            {
              "name": "East Sepik",
              "cities": ["Wewak", "Maprik"]
            },
            {
              "name": "Enga",
              "cities": ["Wabag", "Tari"]
            },
            {
              "name": "Gulf",
              "cities": ["Kerema", "Mori"]
            },
            {
              "name": "Madang",
              "cities": ["Madang", "Karkar"]
            },
            {
              "name": "Manus",
              "cities": ["Lorengau", "Kavieng"]
            },
            {
              "name": "Milne Bay",
              "cities": ["Alotau", "Misima"]
            },
            {
              "name": "Morobe",
              "cities": ["Lae", "Bulolo"]
            },
            {
              "name": "National Capital",
              "cities": ["Port Moresby"]
            },
            {
              "name": "New Ireland",
              "cities": ["Kavieng", "Namatanai"]
            },
            {
              "name": "Northern",
              "cities": ["Popondetta", "Afore"]
            },
            {
              "name": "Sandaun",
              "cities": ["Vanimo", "Aitape"]
            },
            {
              "name": "Southern Highlands",
              "cities": ["Mendi", "Kagua"]
            },
            {
              "name": "Western",
              "cities": ["Kiunga", "Tabubil"]
            },
            {
              "name": "Western Highlands",
              "cities": ["Mt. Hagen", "Tambul"]
            },
            {
              "name": "West New Britain",
              "cities": ["Kimbe", "Hoskins"]
            }
          ]
        },
        {
          "country": "Paraguay",
          "states": [
            {
              "name": "Alto Paraguay",
              "cities": ["Fuerte Olimpo", "Bahía Negra"]
            },
            {
              "name": "Alto Parana",
              "cities": ["Ciudad del Este", "Hernandarias"]
            },
            {
              "name": "Amambay",
              "cities": ["Pedro Juan Caballero", "Bella Vista"]
            },
            {
              "name": "Asuncion",
              "cities": ["Asuncion"]
            },
            {
              "name": "Boqueron",
              "cities": ["Filadelfia", "Mariscal Estigarribia"]
            },
            {
              "name": "Caaguazu",
              "cities": ["Coronel Oviedo", "Villarrica"]
            },
            {
              "name": "Caazapa",
              "cities": ["Caazapa", "Yuty"]
            },
            {
              "name": "Canindeyu",
              "cities": ["Salto del Guaira", "Ypehu"]
            },
            {
              "name": "Central",
              "cities": ["San Lorenzo", "Aregua"]
            },
            {
              "name": "Concepcion",
              "cities": ["Concepcion", "San Carlos"]
            },
            {
              "name": "Cordillera",
              "cities": ["Eusebio Ayala", "Caacupé"]
            },
            {
              "name": "Guaira",
              "cities": ["Villarrica", "Yataity"]
            },
            {
              "name": "Itapua",
              "cities": ["Encarnacion", "Jose Leandro Oviedo"]
            },
            {
              "name": "Misiones",
              "cities": ["San Ignacio", "Santa Maria"]
            },
            {
              "name": "Neembucu",
              "cities": ["Villa Hayes", "Mariscal Estigarribia"]
            },
            {
              "name": "Paraguari",
              "cities": ["Paraguari", "Carapegua"]
            },
            {
              "name": "Presidente Hayes",
              "cities": ["Resistencia", "Piedras Negras"]
            },
            {
              "name": "San Pedro",
              "cities": ["San Estanislao", "Villa del Rosario"]
            }
          ]
        },
        {
          "country": "Peru",
          "states": [
            {
              "name": "Amazonas",
              "cities": ["Chachapoyas", "Bagua"]
            },
            {
              "name": "Ancash",
              "cities": ["Huaraz", "Caraz"]
            },
            {
              "name": "Apurimac",
              "cities": ["Abancay", "Andahuaylas"]
            },
            {
              "name": "Arequipa",
              "cities": ["Arequipa", "Camaná"]
            },
            {
              "name": "Ayacucho",
              "cities": ["Ayacucho", "Huanta"]
            },
            {
              "name": "Cajamarca",
              "cities": ["Cajamarca", "Celendín"]
            },
            {
              "name": "Callao",
              "cities": ["Callao", "La Punta"]
            },
            {
              "name": "Cusco",
              "cities": ["Cusco", "Urubamba"]
            },
            {
              "name": "Huancavelica",
              "cities": ["Huancavelica", "Acobamba"]
            },
            {
              "name": "Huanuco",
              "cities": ["Huanuco", "Tingo María"]
            },
            {
              "name": "Ica",
              "cities": ["Ica", "Pisco"]
            },
            {
              "name": "Junin",
              "cities": ["Huancayo", "Junín"]
            },
            {
              "name": "La Libertad",
              "cities": ["Trujillo", "Chicama"]
            },
            {
              "name": "Lambayeque",
              "cities": ["Chiclayo", "Lambayeque"]
            },
            {
              "name": "Lima",
              "cities": ["Lima", "Callao"]
            },
            {
              "name": "Loreto",
              "cities": ["Iquitos", "Nauta"]
            },
            {
              "name": "Madre de Dios",
              "cities": ["Puerto Maldonado", "Tambopata"]
            },
            {
              "name": "Moquegua",
              "cities": ["Moquegua", "Ilo"]
            },
            {
              "name": "Pasco",
              "cities": ["Oxapampa", "Tantamayo"]
            },
            {
              "name": "Piura",
              "cities": ["Piura", "Sullana"]
            },
            {
              "name": "Puno",
              "cities": ["Puno", "Juliaca"]
            },
            {
              "name": "San Martin",
              "cities": ["Moyobamba", "Tarapoto"]
            },
            {
              "name": "Tacna",
              "cities": ["Tacna", "Coronel Gregorio"]
            },
            {
              "name": "Tumbes",
              "cities": ["Tumbes", "Zorritos"]
            },
            {
              "name": "Ucayali",
              "cities": ["Pucallpa", "Atalaya"]
            }
          ]
        },
        {
          "country": "Philippines",
          "states": [
            {
              "name": "Abra",
              "cities": ["Bangued", "Lagangilang"]
            },
            {
              "name": "Agusan del Norte",
              "cities": ["Butuan", "Las Nieves"]
            },
            {
              "name": "Agusan del Sur",
              "cities": ["Prosperidad", "Talacogon"]
            },
            {
              "name": "Aklan",
              "cities": ["Altavas", "Balete","Banga","Batan","Buruanga","Ibajay","Kalibo", "Lezo", "Libacao", "Madalag", "Makato", "Malay", "Malinao", "Nabas", "New Washington", "Numancia", "Tangalan"]
            },
            {
              "name": "Albay",
              "cities": ["Legazpi", "Tabaco", "Ligao"]
            },
            {
              "name": "Antique",
              "cities": ["San Jose", "Sibalom"]
            },
            {
              "name": "Apayao",
              "cities": ["Conner", "Caboogan"]
            },
            {
              "name": "Aurora",
              "cities": ["Baler", "Casanayan"]
            },
            {
              "name": "Basilan",
              "cities": ["Isabela", "Lamitan"]
            },
            {
              "name": "Bataan",
              "cities": ["Balanga", "Dinalupihan"]
            },
            {
              "name": "Batanes",
              "cities": ["Basco", "Ivana"]
            },
            {
              "name": "Batangas",
              "cities": ["Batangas City", "Lipa"]
            },
            {
              "name": "Biliran",
              "cities": ["Naval", "Caibiran"]
            },
            {
              "name": "Benguet",
              "cities": ["Baguio", "La Trinidad"]
            },
            {
              "name": "Bohol",
              "cities": ["Tagbilaran", "Danao"]
            },
            {
              "name": "Bukidnon",
              "cities": ["Malaybalay", "Valencia"]
            },
            {
              "name": "Bulacan",
              "cities": ["Malolos", "Meycauayan"]
            },
            {
              "name": "Cagayan",
              "cities": ["Tuguegarao", "Aparri"]
            },
            {
              "name": "Camarines Norte",
              "cities": ["Daet", "Jose Panganiban"]
            },
            {
              "name": "Camarines Sur",
              "cities": ["Naga", "Iriga"]
            },
            {
              "name": "Camiguin",
              "cities": ["Mambajao", "Catarman"]
            },
            {
              "name": "Capiz",
              "cities": ["Roxas", "Mambusao"]
            },
            {
              "name": "Catanduanes",
              "cities": ["Virac", "San Andres"]
            },
            {
              "name": "Cavite",
              "cities": ["Tagaytay", "Imus"]
            },
            {
              "name": "Cebu",
              "cities": ["Cebu City", "Lapu-Lapu", "Mandaue", "Bogo", "Carcar", "Danao", "Naga", "Talisay", "Toledo"]
            },
            {
              "name": "Compostela",
              "cities": ["Compostela", "Danao"]
            },
            {
              "name": "Davao del Norte",
              "cities": ["Tagum", "Panabo", "Samal"]
            },
            {
              "name": "Davao del Sur",
              "cities": ["Digos", "Matanao"]
            },
            {
              "name": "Davao Oriental",
              "cities": ["Mati", "Banaybanay"]
            },
            {
              "name": "Eastern Samar",
              "cities": ["Borongan", "Guiuan"]
            },
            {
              "name": "Guimaras",
              "cities": ["Jordan", "Buenavista"]
            },
            {
              "name": "Ifugao",
              "cities": ["Natonin", "Kiangan"]
            },
            {
              "name": "Ilocos Norte",
              "cities": ["Laoag", "Batac"]
            },
            {
              "name": "Ilocos Sur",
              "cities": ["Vigan", "Candon"]
            },
            {
              "name": "Iloilo",
              "cities": ["Iloilo City", "Passi"]
            },
            {
              "name": "Isabela",
              "cities": ["Ilagan", "Echague"]
            },
            {
              "name": "Kalinga",
              "cities": ["Tabuk", "Pasil"]
            },
            {
              "name": "Laguna",
              "cities": ["Santa Rosa", "Calamba"]
            },
            {
              "name": "Lanao del Norte",
              "cities": ["Tubod", "Iligan"]
            },
            {
              "name": "Lanao del Sur",
              "cities": ["Marawi", "Balindong"]
            },
            {
              "name": "La Union",
              "cities": ["San Fernando", "Agoo"]
            },
            {
              "name": "Leyte",
              "cities": ["Tacloban", "Ormoc"]
            },
            {
              "name": "Maguindanao",
              "cities": ["Cotabato", "Shariff Aguak"]
            },
            {
              "name": "Marinduque",
              "cities": ["Boac", "Mogpog"]
            },
            {
              "name": "Masbate",
              "cities": ["Masbate", "Mobo"]
            },
            {
              "name": "Mindoro Occidental",
              "cities": ["Mamburao", "San Jose"]
            },
            {
              "name": "Mindoro Oriental",
              "cities": ["Calapan", "Bansud"]
            },
            {
              "name": "Misamis Occidental",
              "cities": ["Ozamiz", "Tangub"]
            },
            {
              "name": "Misamis Oriental",
              "cities": ["Cagayan de Oro", "Gingoog"]
            },
            {
              "name": "Mountain Province",
              "cities": ["Bontoc", "Sagada"]
            },
            {
              "name": "Negros Occidental",
              "cities": ["Bacolod", "Silay"]
            },
            {
              "name": "Negros Oriental",
              "cities": ["Dumaguete", "Valencia"]
            },
            {
              "name": "North Cotabato",
              "cities": ["Kidapawan", "Midsayap"]
            },
            {
              "name": "Northern Samar",
              "cities": ["Catarman", "Laoang"]
            },
            {
              "name": "Nueva Ecija",
              "cities": ["Cabanatuan", "Gapan"]
            },
            {
              "name": "Nueva Vizcaya",
              "cities": ["Bayombong", "Solano"]
            },
            {
              "name": "Palawan",
              "cities": ["Puerto Princesa", "El Nido"]
            },
            {
              "name": "Pampanga",
              "cities": ["San Fernando", "Angeles"]
            },
            {
              "name": "Pangasinan",
              "cities": ["Lingayen", "Dagupan"]
            },
            {
              "name": "Quezon",
              "cities": ["Lucena", "Tiaong"]
            },
            {
              "name": "Quirino",
              "cities": ["Cabarroguis", "Maddela"]
            },
            {
              "name": "Rizal",
              "cities": ["Antipolo", "Rodriguez"]
            },
            {
              "name": "Romblon",
              "cities": ["Odiongan", "Romblon"]
            },
            {
              "name": "Samar",
              "cities": ["Catbalogan", "Calbayog"]
            },
            {
              "name": "Sarangani",
              "cities": ["Alabel", "Maasim"]
            },
            {
              "name": "Siquijor",
              "cities": ["Siquijor", "Larena"]
            },
            {
              "name": "Sorsogon",
              "cities": ["Sorsogon City", "Bulusan"]
            },
            {
              "name": "South Cotabato",
              "cities": ["Koronadal", "General Santos"]
            },
            {
              "name": "Southern Leyte",
              "cities": ["Maasin", "Sogod"]
            },
            {
              "name": "Sultan Kudarat",
              "cities": ["Isulan", "Tacurong"]
            },
            {
              "name": "Sulu",
              "cities": ["Jolo", "Patikul"]
            },
            {
              "name": "Surigao del Norte",
              "cities": ["Surigao City", "Dapa"]
            },
            {
              "name": "Surigao del Sur",
              "cities": ["Tandag", "Bislig"]
            },
            {
              "name": "Tarlac",
              "cities": ["Tarlac City", "Capas"]
            },
            {
              "name": "Tawi-Tawi",
              "cities": ["Bongao", "Panglima Sugala"]
            },
            {
              "name": "Zambales",
              "cities": ["Olongapo", "Subic"]
            },
            {
              "name": "Zamboanga del Norte",
              "cities": ["Dipolog", "Dapitan"]
            },
            {
              "name": "Zamboanga del Sur",
              "cities": ["Pagadian", "Zamboanga City"]
            },
            {
              "name": "Zamboanga Sibugay",
              "cities": ["Ipil", "Titay"]
            }
          ]
        },
        {
          "country": "Poland",
          "states": [
            {
              "name": "Greater Poland (Wielkopolskie)",
              "cities": ["Poznań", "Kalisz"]
            },
            {
              "name": "Kuyavian-Pomeranian (Kujawsko-Pomorskie)",
              "cities": ["Bydgoszcz", "Toruń"]
            },
            {
              "name": "Lesser Poland (Malopolskie)",
              "cities": ["Kraków", "Tarnów"]
            },
            {
              "name": "Lodz (Lodzkie)",
              "cities": ["Łódź", "Piotrków Trybunalski"]
            },
            {
              "name": "Lower Silesian (Dolnoslaskie)",
              "cities": ["Wrocław", "Legnica"]
            },
            {
              "name": "Lublin (Lubelskie)",
              "cities": ["Lublin", "Chełm"]
            },
            {
              "name": "Lubusz (Lubuskie)",
              "cities": ["Zielona Góra", "Gorzów Wielkopolski"]
            },
            {
              "name": "Masovian (Mazowieckie)",
              "cities": ["Warsaw", "Radom"]
            },
            {
              "name": "Opole (Opolskie)",
              "cities": ["Opole", "Kędzierzyn-Koźle"]
            },
            {
              "name": "Podlasie (Podlaskie)",
              "cities": ["Białystok", "Suwałki"]
            },
            {
              "name": "Pomeranian (Pomorskie)",
              "cities": ["Gdańsk", "Gdynia"]
            },
            {
              "name": "Silesian (Slaskie)",
              "cities": ["Katowice", "Częstochowa"]
            },
            {
              "name": "Subcarpathian (Podkarpackie)",
              "cities": ["Rzeszów", "Przemyśl"]
            },
            {
              "name": "Swietokrzyskie (Swietokrzyskie)",
              "cities": ["Kielce", "Ostrowiec Świętokrzyski"]
            },
            {
              "name": "Warmian-Masurian (Warminsko-Mazurskie)",
              "cities": ["Olsztyn", "Elbląg"]
            },
            {
              "name": "West Pomeranian (Zachodniopomorskie)",
              "cities": ["Szczecin", "Koszalin"]
            }
          ]
        },
        {
          "country": "Portugal",
          "states": [
            {
              "name": "Aveiro",
              "cities": ["Aveiro", "Águeda"]
            },
            {
              "name": "Acores",
              "cities": ["Ponta Delgada", "Angra do Heroísmo"]
            },
            {
              "name": "Beja",
              "cities": ["Beja", "Moura"]
            },
            {
              "name": "Braga",
              "cities": ["Braga", "Guimarães"]
            },
            {
              "name": "Braganca",
              "cities": ["Bragança", "Mirandela"]
            },
            {
              "name": "Castelo Branco",
              "cities": ["Castelo Branco", "Covilhã"]
            },
            {
              "name": "Coimbra",
              "cities": ["Coimbra", "Figueira da Foz"]
            },
            {
              "name": "Evora",
              "cities": ["Évora", "Estremoz"]
            },
            {
              "name": "Faro",
              "cities": ["Faro", "Loulé"]
            },
            {
              "name": "Guarda",
              "cities": ["Guarda", "Seia"]
            },
            {
              "name": "Leiria",
              "cities": ["Leiria", "Caldas da Rainha"]
            },
            {
              "name": "Lisboa",
              "cities": ["Lisbon", "Sintra"]
            },
            {
              "name": "Madeira",
              "cities": ["Funchal", "Câmara de Lobos"]
            },
            {
              "name": "Portalegre",
              "cities": ["Portalegre", "Elvas"]
            },
            {
              "name": "Porto",
              "cities": ["Porto", "Vila Nova de Gaia"]
            },
            {
              "name": "Santarem",
              "cities": ["Santarém", "Tomar"]
            },
            {
              "name": "Setubal",
              "cities": ["Setúbal", "Almada"]
            },
            {
              "name": "Viana do Castelo",
              "cities": ["Viana do Castelo", "Ponte de Lima"]
            },
            {
              "name": "Vila Real",
              "cities": ["Vila Real", "Chaves"]
            },
            {
              "name": "Viseu",
              "cities": ["Viseu", "Lamego"]
            }
          ]
        },
        {
          "country": "Qatar",
          "states": [
            {
              "name": "Ad Dawhah",
              "cities": ["Doha", "Al Wakrah"]
            },
            {
              "name": "Al Ghuwayriyah",
              "cities": ["Al Ghuwayriyah"]
            },
            {
              "name": "Al Jumayliyah",
              "cities": ["Al Jumayliyah"]
            },
            {
              "name": "Al Khawr",
              "cities": ["Al Khawr", "Al Thakhira"]
            },
            {
              "name": "Al Wakrah",
              "cities": ["Al Wakrah", "Al Wukair"]
            },
            {
              "name": "Ar Rayyan",
              "cities": ["Ar Rayyan", "Al Shahaniya"]
            },
            {
              "name": "Jarayan al Batinah",
              "cities": ["Jarayan al Batinah"]
            },
            {
              "name": "Madinat ash Shamal",
              "cities": ["Madinat ash Shamal"]
            },
            {
              "name": "Umm Sa'id",
              "cities": ["Umm Sa'id"]
            },
            {
              "name": "Umm Salal",
              "cities": ["Umm Salal", "Al Kharaitiyat"]
            }
          ]
        },
        {
          "country": "Romania",
          "states": [
            {
              "name": "Alba",
              "cities": ["Alba Iulia", "Aiud"]
            },
            {
              "name": "Arad",
              "cities": ["Arad", "Lipova"]
            },
            {
              "name": "Arges",
              "cities": ["Pitești", "Câmpulung"]
            },
            {
              "name": "Bacau",
              "cities": ["Bacău", "Moinești"]
            },
            {
              "name": "Bihor",
              "cities": ["Oradea", "Beiuș"]
            },
            {
              "name": "Bistrita-Nasaud",
              "cities": ["Bistrița", "Beclean"]
            },
            {
              "name": "Botosani",
              "cities": ["Botoșani", "Dorohoi"]
            },
            {
              "name": "Braila",
              "cities": ["Brăila", "Ianca"]
            },
            {
              "name": "Brasov",
              "cities": ["Brașov", "Săcele"]
            },
            {
              "name": "Bucuresti",
              "cities": ["Bucharest"]
            },
            {
              "name": "Buzau",
              "cities": ["Buzău", "Râmnicu Sărat"]
            },
            {
              "name": "Calarasi",
              "cities": ["Călărași", "Oltenița"]
            },
            {
              "name": "Caras-Severin",
              "cities": ["Reșița", "Caransebeș"]
            },
            {
              "name": "Cluj",
              "cities": ["Cluj-Napoca", "Turda"]
            },
            {
              "name": "Constanta",
              "cities": ["Constanța", "Mangalia"]
            },
            {
              "name": "Covasna",
              "cities": ["Sfântu Gheorghe", "Târgu Secuiesc"]
            },
            {
              "name": "Dimbovita",
              "cities": ["Târgoviște", "Moreni"]
            },
            {
              "name": "Dolj",
              "cities": ["Craiova", "Băilești"]
            },
            {
              "name": "Galati",
              "cities": ["Galați", "Tecuci"]
            },
            {
              "name": "Gorj",
              "cities": ["Târgu Jiu", "Motru"]
            },
            {
              "name": "Giurgiu",
              "cities": ["Giurgiu", "Bolintin-Vale"]
            },
            {
              "name": "Harghita",
              "cities": ["Miercurea Ciuc", "Gheorgheni"]
            },
            {
              "name": "Hunedoara",
              "cities": ["Deva", "Hunedoara"]
            },
            {
              "name": "Ialomita",
              "cities": ["Slobozia", "Fetești"]
            },
            {
              "name": "Iasi",
              "cities": ["Iași", "Pașcani"]
            },
            {
              "name": "Ilfov",
              "cities": ["Buftea", "Otopeni"]
            },
            {
              "name": "Maramures",
              "cities": ["Baia Mare", "Sighetu Marmației"]
            },
            {
              "name": "Mehedinti",
              "cities": ["Drobeta-Turnu Severin", "Orșova"]
            },
            {
              "name": "Mures",
              "cities": ["Târgu Mureș", "Reghin"]
            },
            {
              "name": "Neamt",
              "cities": ["Piatra Neamț", "Roman"]
            },
            {
              "name": "Olt",
              "cities": ["Slatina", "Caracal"]
            },
            {
              "name": "Prahova",
              "cities": ["Ploiești", "Câmpina"]
            },
            {
              "name": "Salaj",
              "cities": ["Zalău", "Șimleu Silvaniei"]
            },
            {
              "name": "Satu Mare",
              "cities": ["Satu Mare", "Carei"]
            },
            {
              "name": "Sibiu",
              "cities": ["Sibiu", "Mediaș"]
            },
            {
              "name": "Suceava",
              "cities": ["Suceava", "Fălticeni"]
            },
            {
              "name": "Teleorman",
              "cities": ["Alexandria", "Roșiorii de Vede"]
            },
            {
              "name": "Timis",
              "cities": ["Timișoara", "Lugoj"]
            },
            {
              "name": "Tulcea",
              "cities": ["Tulcea", "Babadag"]
            },
            {
              "name": "Vaslui",
              "cities": ["Vaslui", "Bârlad"]
            },
            {
              "name": "Vilcea",
              "cities": ["Râmnicu Vâlcea", "Drăgășani"]
            },
            {
              "name": "Vrancea",
              "cities": ["Focșani", "Adjud"]
            }
          ]
        },
        {
          "country": "Russia",
          "states": [
            {
              "name": "Amur",
              "cities": ["Blagoveshchensk", "Belogorsk"]
            },
            {
              "name": "Arkhangel'sk",
              "cities": ["Arkhangelsk", "Severodvinsk"]
            },
            {
              "name": "Astrakhan'",
              "cities": ["Astrakhan", "Akhtubinsk"]
            },
            {
              "name": "Belgorod",
              "cities": ["Belgorod", "Stary Oskol"]
            },
            {
              "name": "Bryansk",
              "cities": ["Bryansk", "Klintsy"]
            },
            {
              "name": "Chelyabinsk",
              "cities": ["Chelyabinsk", "Magnitogorsk"]
            },
            {
              "name": "Chita",
              "cities": ["Chita", "Krasnokamensk"]
            },
            {
              "name": "Irkutsk",
              "cities": ["Irkutsk", "Bratsk"]
            },
            {
              "name": "Ivanovo",
              "cities": ["Ivanovo", "Kineshma"]
            },
            {
              "name": "Kaliningrad",
              "cities": ["Kaliningrad", "Sovetsk"]
            },
            {
              "name": "Kaluga",
              "cities": ["Kaluga", "Obninsk"]
            },
            {
              "name": "Kamchatka",
              "cities": ["Petropavlovsk-Kamchatsky", "Yelizovo"]
            },
            {
              "name": "Kemerovo",
              "cities": ["Kemerovo", "Novokuznetsk"]
            },
            {
              "name": "Kirov",
              "cities": ["Kirov", "Kirovo-Chepetsk"]
            },
            {
              "name": "Kostroma",
              "cities": ["Kostroma", "Bui"]
            },
            {
              "name": "Kurgan",
              "cities": ["Kurgan", "Shadrinsk"]
            },
            {
              "name": "Kursk",
              "cities": ["Kursk", "Zheleznogorsk"]
            },
            {
              "name": "Leningrad",
              "cities": ["Gatchina", "Vyborg"]
            },
            {
              "name": "Lipetsk",
              "cities": ["Lipetsk", "Yelets"]
            },
            {
              "name": "Magadan",
              "cities": ["Magadan", "Susuman"]
            },
            {
              "name": "Moscow",
              "cities": ["Moscow", "Zelenograd"]
            },
            {
              "name": "Murmansk",
              "cities": ["Murmansk", "Apatity"]
            },
            {
              "name": "Nizhniy Novgorod",
              "cities": ["Nizhny Novgorod", "Dzerzhinsk"]
            },
            {
              "name": "Novgorod",
              "cities": ["Veliky Novgorod", "Borovichi"]
            },
            {
              "name": "Novosibirsk",
              "cities": ["Novosibirsk", "Berdsk"]
            },
            {
              "name": "Omsk",
              "cities": ["Omsk", "Tara"]
            },
            {
              "name": "Orenburg",
              "cities": ["Orenburg", "Orsk"]
            },
            {
              "name": "Orel",
              "cities": ["Oryol", "Livny"]
            },
            {
              "name": "Penza",
              "cities": ["Penza", "Kuznetsk"]
            },
            {
              "name": "Perm'",
              "cities": ["Perm", "Berezniki"]
            },
            {
              "name": "Pskov",
              "cities": ["Pskov", "Velikiye Luki"]
            },
            {
              "name": "Rostov",
              "cities": ["Rostov-on-Don", "Taganrog"]
            },
            {
              "name": "Ryazan'",
              "cities": ["Ryazan", "Kasimov"]
            },
            {
              "name": "Sakhalin",
              "cities": ["Yuzhno-Sakhalinsk", "Korsakov"]
            },
            {
              "name": "Samara",
              "cities": ["Samara", "Tolyatti"]
            },
            {
              "name": "Saratov",
              "cities": ["Saratov", "Engels"]
            },
            {
              "name": "Smolensk",
              "cities": ["Smolensk", "Vyazma"]
            },
            {
              "name": "Sverdlovsk",
              "cities": ["Yekaterinburg", "Nizhny Tagil"]
            },
            {
              "name": "Tambov",
              "cities": ["Tambov", "Michurinsk"]
            },
            {
              "name": "Tomsk",
              "cities": ["Tomsk", "Seversk"]
            },
            {
              "name": "Tula",
              "cities": ["Tula", "Novomoskovsk"]
            },
            {
              "name": "Tver'",
              "cities": ["Tver", "Rzhev"]
            },
            {
              "name": "Tyumen'",
              "cities": ["Tyumen", "Tobolsk"]
            },
            {
              "name": "Ul'yanovsk",
              "cities": ["Ulyanovsk", "Dimitrovgrad"]
            },
            {
              "name": "Vladimir",
              "cities": ["Vladimir", "Kovrov"]
            },
            {
              "name": "Volgograd",
              "cities": ["Volgograd", "Volzhsky"]
            },
            {
              "name": "Vologda",
              "cities": ["Vologda", "Cherepovets"]
            },
            {
              "name": "Voronezh",
              "cities": ["Voronezh", "Borisoglebsk"]
            },
            {
              "name": "Yaroslavl'",
              "cities": ["Yaroslavl", "Rybinsk"]
            },
            {
              "name": "Adygeya",
              "cities": ["Maykop", "Adygeysk"]
            },
            {
              "name": "Altay",
              "cities": ["Gorno-Altaysk", "Mayma"]
            },
            {
              "name": "Bashkortostan",
              "cities": ["Ufa", "Sterlitamak"]
            },
            {
              "name": "Buryatiya",
              "cities": ["Ulan-Ude", "Kyakhta"]
            },
            {
              "name": "Chechnya",
              "cities": ["Grozny", "Urus-Martan"]
            },
            {
              "name": "Chuvashiya",
              "cities": ["Cheboksary", "Novocheboksarsk"]
            },
            {
              "name": "Dagestan",
              "cities": ["Makhachkala", "Derbent"]
            },
            {
              "name": "Ingushetiya",
              "cities": ["Magas", "Nazran"]
            },
            {
              "name": "Kabardino-Balkariya",
              "cities": ["Nalchik", "Prokhladny"]
            },
            {
              "name": "Kalmykiya",
              "cities": ["Elista", "Lagan"]
            },
            {
              "name": "Karachayevo-Cherkesiya",
              "cities": ["Cherkessk", "Ust-Dzheguta"]
            },
            {
              "name": "Kareliya",
              "cities": ["Petrozavodsk", "Kondopoga"]
            },
            {
              "name": "Khakasiya",
              "cities": ["Abakan", "Chernogorsk"]
            },
            {
              "name": "Komi",
              "cities": ["Syktyvkar", "Ukhta"]
            },
            {
              "name": "Mariy-El",
              "cities": ["Yoshkar-Ola", "Volzhsk"]
            },
            {
              "name": "Mordoviya",
              "cities": ["Saransk", "Kovylkino"]
            },
            {
              "name": "Sakha",
              "cities": ["Yakutsk", "Neryungri"]
            },
            {
              "name": "North Ossetia",
              "cities": ["Vladikavkaz", "Mozdok"]
            },
            {
              "name": "Tatarstan",
              "cities": ["Kazan", "Naberezhnye Chelny"]
            },
            {
              "name": "Tyva",
              "cities": ["Kyzyl", "Ak-Dovurak"]
            },
            {
              "name": "Udmurtiya",
              "cities": ["Izhevsk", "Sarapul"]
            },
            {
              "name": "Aga Buryat",
              "cities": ["Aginskoye", "Novoaginsk"]
            },
            {
              "name": "Chukotka",
              "cities": ["Anadyr", "Bilibino"]
            },
            {
              "name": "Evenk",
              "cities": ["Tura", "Baykit"]
            },
            {
              "name": "Khanty-Mansi",
              "cities": ["Khanty-Mansiysk", "Surgut"]
            },
            {
              "name": "Komi-Permyak",
              "cities": ["Kudymkar", "Gayny"]
            },
            {
              "name": "Koryak",
              "cities": ["Palana", "Tilichiki"]
            },
            {
              "name": "Nenets",
              "cities": ["Naryan-Mar", "Amderma"]
            },
            {
              "name": "Taymyr",
              "cities": ["Dudinka", "Khatanga"]
            },
            {
              "name": "Ust'-Orda Buryat",
              "cities": ["Ust-Ordynsky", "Bayanday"]
            },
            {
              "name": "Yamalo-Nenets",
              "cities": ["Salekhard", "Novy Urengoy"]
            },
            {
              "name": "Altay",
              "cities": ["Barnaul", "Biysk"]
            },
            {
              "name": "Khabarovsk",
              "cities": ["Khabarovsk", "Komsomolsk-on-Amur"]
            },
            {
              "name": "Krasnodar",
              "cities": ["Krasnodar", "Sochi"]
            },
            {
              "name": "Krasnoyarsk",
              "cities": ["Krasnoyarsk", "Norilsk"]
            },
            {
              "name": "Primorskiy",
              "cities": ["Vladivostok", "Nakhodka"]
            },
            {
              "name": "Stavropol'",
              "cities": ["Stavropol", "Pyatigorsk"]
            },
            {
              "name": "Moscow",
              "cities": ["Moscow", "Zelenograd"]
            },
            {
              "name": "St. Petersburg",
              "cities": ["Saint Petersburg", "Kolpino"]
            },
            {
              "name": "Yevrey",
              "cities": ["Birobidzhan", "Obluchye"]
            }
          ]
        },
        {
          "country": "Rwanda",
          "states": [
            {
              "name": "Butare",
              "cities": ["Butare", "Nyamagabe"]
            },
            {
              "name": "Byumba",
              "cities": ["Byumba", "Rwinkwavu"]
            },
            {
              "name": "Cyangugu",
              "cities": ["Cyangugu", "Kamembe"]
            },
            {
              "name": "Gikongoro",
              "cities": ["Gikongoro", "Nyanza"]
            },
            {
              "name": "Gisenyi",
              "cities": ["Gisenyi", "Rubavu"]
            },
            {
              "name": "Gitarama",
              "cities": ["Gitarama", "Ruhango"]
            },
            {
              "name": "Kibungo",
              "cities": ["Kibungo", "Rwamagana"]
            },
            {
              "name": "Kibuye",
              "cities": ["Kibuye", "Karongi"]
            },
            {
              "name": "Kigali Rurale",
              "cities": ["Kigali", "Kicukiro"]
            },
            {
              "name": "Kigali-ville",
              "cities": ["Kigali", "Nyarugenge"]
            },
            {
              "name": "Umutara",
              "cities": ["Nyagatare", "Rwinkwavu"]
            },
            {
              "name": "Ruhengeri",
              "cities": ["Ruhengeri", "Musanze"]
            }
          ]
        },
        {
          "country": "Samoa",
          "states": [
            {
              "name": "A'ana",
              "cities": ["Leulumoega", "Fasito'outa"]
            },
            {
              "name": "Aiga-i-le-Tai",
              "cities": ["Mulifanua", "Faleu"]
            },
            {
              "name": "Atua",
              "cities": ["Aleipata", "Lufilufi"]
            },
            {
              "name": "Fa'asaleleaga",
              "cities": ["Safotulafai", "Sapapali'i"]
            },
            {
              "name": "Gaga'emauga",
              "cities": ["Saleaula", "Samalaeulu"]
            },
            {
              "name": "Gagaifomauga",
              "cities": ["Aopo", "Safotu"]
            },
            {
              "name": "Palauli",
              "cities": ["Vailoa", "Palauli"]
            },
            {
              "name": "Satupa'itea",
              "cities": ["Satupa'itea", "Pitonuu"]
            },
            {
              "name": "Tuamasaga",
              "cities": ["Apia", "Malie"]
            },
            {
              "name": "Va'a-o-Fonoti",
              "cities": ["Samamea", "Faleapuna"]
            },
            {
              "name": "Vaisigano",
              "cities": ["Asau", "Neiafu"]
            }
          ]
        },
        {
          "country": "San Marino",
          "states": [
            {
              "name": "Acquaviva",
              "cities": ["Acquaviva"]
            },
            {
              "name": "Borgo Maggiore",
              "cities": ["Borgo Maggiore"]
            },
            {
              "name": "Chiesanuova",
              "cities": ["Chiesanuova"]
            },
            {
              "name": "Domagnano",
              "cities": ["Domagnano"]
            },
            {
              "name": "Faetano",
              "cities": ["Faetano"]
            },
            {
              "name": "Fiorentino",
              "cities": ["Fiorentino"]
            },
            {
              "name": "Montegiardino",
              "cities": ["Montegiardino"]
            },
            {
              "name": "San Marino Citta",
              "cities": ["San Marino"]
            },
            {
              "name": "Serravalle",
              "cities": ["Serravalle"]
            }
          ]
        },
        {
          "country": "Sao Tome",
          "states": []
        },
        {
          "country": "Saudi Arabia",
          "states": [
            {
              "name": "Al Bahah",
              "cities": ["Al Bahah", "Baljurashi"]
            },
            {
              "name": "Al Hudud ash Shamaliyah",
              "cities": ["Arar", "Turaif"]
            },
            {
              "name": "Al Jawf",
              "cities": ["Sakaka", "Qurayyat"]
            },
            {
              "name": "Al Madinah",
              "cities": ["Medina", "Yanbu"]
            },
            {
              "name": "Al Qasim",
              "cities": ["Buraidah", "Unaizah"]
            },
            {
              "name": "Ar Riyad",
              "cities": ["Riyadh", "Diriyah"]
            },
            {
              "name": "Ash Sharqiyah",
              "cities": ["Dammam", "Al Khobar"]
            },
            {
              "name": "'Asir",
              "cities": ["Abha", "Khamis Mushait"]
            },
            {
              "name": "Ha'il",
              "cities": ["Ha'il", "Baqaa"]
            },
            {
              "name": "Jizan",
              "cities": ["Jizan", "Sabya"]
            },
            {
              "name": "Makkah",
              "cities": ["Mecca", "Jeddah"]
            },
            {
              "name": "Najran",
              "cities": ["Najran", "Sharurah"]
            },
            {
              "name": "Tabuk",
              "cities": ["Tabuk", "Al Wajh"]
            }
          ]
        },
        {
          "country": "Senegal",
          "states": [
            {
              "name": "Dakar",
              "cities": ["Dakar", "Pikine"]
            },
            {
              "name": "Diourbel",
              "cities": ["Diourbel", "Bambey"]
            },
            {
              "name": "Fatick",
              "cities": ["Fatick", "Foundiougne"]
            },
            {
              "name": "Kaolack",
              "cities": ["Kaolack", "Guinguinéo"]
            },
            {
              "name": "Kolda",
              "cities": ["Kolda", "Vélingara"]
            },
            {
              "name": "Louga",
              "cities": ["Louga", "Kébémer"]
            },
            {
              "name": "Matam",
              "cities": ["Matam", "Ourossogui"]
            },
            {
              "name": "Saint-Louis",
              "cities": ["Saint-Louis", "Richard-Toll"]
            },
            {
              "name": "Tambacounda",
              "cities": ["Tambacounda", "Bakel"]
            },
            {
              "name": "Thies",
              "cities": ["Thiès", "Mbour"]
            },
            {
              "name": "Ziguinchor",
              "cities": ["Ziguinchor", "Bignona"]
            }
          ]
        },
        {
          "country": "Serbia and Montenegro",
          "states": [
            {
              "name": "Kosovo",
              "cities": ["Pristina", "Prizren"]
            },
            {
              "name": "Montenegro",
              "cities": ["Podgorica", "Nikšić"]
            },
            {
              "name": "Serbia",
              "cities": ["Belgrade", "Novi Sad"]
            },
            {
              "name": "Vojvodina",
              "cities": ["Novi Sad", "Subotica"]
            }
          ]
        },
        {
          "country": "Seychelles",
          "states": [
            {
              "name": "Anse aux Pins",
              "cities": ["Anse aux Pins"]
            },
            {
              "name": "Anse Boileau",
              "cities": ["Anse Boileau"]
            },
            {
              "name": "Anse Etoile",
              "cities": ["Anse Etoile"]
            },
            {
              "name": "Anse Louis",
              "cities": ["Anse Louis"]
            },
            {
              "name": "Anse Royale",
              "cities": ["Anse Royale"]
            },
            {
              "name": "Baie Lazare",
              "cities": ["Baie Lazare"]
            },
            {
              "name": "Baie Sainte Anne",
              "cities": ["Baie Sainte Anne"]
            },
            {
              "name": "Beau Vallon",
              "cities": ["Beau Vallon"]
            },
            {
              "name": "Bel Air",
              "cities": ["Bel Air"]
            },
            {
              "name": "Bel Ombre",
              "cities": ["Bel Ombre"]
            },
            {
              "name": "Cascade",
              "cities": ["Cascade"]
            },
            {
              "name": "Glacis",
              "cities": ["Glacis"]
            },
            {
              "name": "Grand' Anse",
              "cities": ["Grand' Anse"]
            },
            {
              "name": "La Digue",
              "cities": ["La Digue"]
            },
            {
              "name": "La Riviere Anglaise",
              "cities": ["La Riviere Anglaise"]
            },
            {
              "name": "Mont Buxton",
              "cities": ["Mont Buxton"]
            },
            {
              "name": "Mont Fleuri",
              "cities": ["Mont Fleuri"]
            },
            {
              "name": "Plaisance",
              "cities": ["Plaisance"]
            },
            {
              "name": "Pointe La Rue",
              "cities": ["Pointe La Rue"]
            },
            {
              "name": "Port Glaud",
              "cities": ["Port Glaud"]
            },
            {
              "name": "Saint Louis",
              "cities": ["Saint Louis"]
            },
            {
              "name": "Takamaka",
              "cities": ["Takamaka"]
            }
          ]
        },
        {
          "country": "Sierra Leone",
          "states": []
        },
        {
          "country": "Singapore",
          "states": []
        },
        {
          "country": "Slovakia",
          "states": [
            {
              "name": "Banskobystricky",
              "cities": ["Banská Bystrica", "Zvolen"]
            },
            {
              "name": "Bratislavsky",
              "cities": ["Bratislava", "Senec"]
            },
            {
              "name": "Kosicky",
              "cities": ["Košice", "Michalovce"]
            },
            {
              "name": "Nitriansky",
              "cities": ["Nitra", "Komárno"]
            },
            {
              "name": "Presovsky",
              "cities": ["Prešov", "Poprad"]
            },
            {
              "name": "Trenciansky",
              "cities": ["Trenčín", "Prievidza"]
            },
            {
              "name": "Trnavsky",
              "cities": ["Trnava", "Piešťany"]
            },
            {
              "name": "Zilinsky",
              "cities": ["Žilina", "Martin"]
            }
          ]
        },
        {
          "country": "Slovenia",
          "states": [
            {
              "name": "Ajdovscina",
              "cities": ["Ajdovščina", "Vipava", "Šturje"]
            },
            {
              "name": "Beltinci",
              "cities": ["Beltinci", "Gančani", "Lipovci"]
            },
            {
              "name": "Benedikt",
              "cities": ["Benedikt", "Sveti Jurij ob Ščavnici"]
            },
            {
              "name": "Bistrica ob Sotli",
              "cities": ["Bistrica ob Sotli", "Podsreda", "Orehovo"]
            },
            {
              "name": "Bled",
              "cities": ["Bled", "Ribno", "Zasip"]
            },
            {
              "name": "Bloke",
              "cities": ["Nova Vas", "Velike Bloke", "Hrib-Loški Potok"]
            },
            {
              "name": "Bohinj",
              "cities": ["Bohinjska Bistrica", "Ribčev Laz", "Srednja Vas v Bohinju"]
            },
            {
              "name": "Borovnica",
              "cities": ["Borovnica", "Poliče", "Prezid"]
            },
            {
              "name": "Bovec",
              "cities": ["Bovec", "Log pod Mangartom", "Soča"]
            },
            {
              "name": "Braslovce",
              "cities": ["Braslovče", "Pristava pri Mestinju"]
            },
            {
              "name": "Brda",
              "cities": ["Dobrovo", "Gonjače", "Kojsko"]
            },
            {
              "name": "Brezice",
              "cities": ["Brežice", "Čatež ob Savi", "Pišece"]
            },
            {
              "name": "Brezovica",
              "cities": ["Brezovica pri Ljubljani", "Notranje Gorice", "Podsabotin"]
            },
            {
              "name": "Cankova",
              "cities": ["Čankova", "Gornji Črnci", "Skakovci"]
            },
            {
              "name": "Celje",
              "cities": ["Celje", "Šmartno v Rožni Dolini", "Ljubečna"]
            },
            {
              "name": "Cerklje na Gorenjskem",
              "cities": ["Cerklje na Gorenjskem", "Zgornje Gorje", "Dobrova"]
            },
            {
              "name": "Cerknica",
              "cities": ["Cerknica", "Rakek", "Begunje pri Cerknici"]
            },
            {
              "name": "Cerkno",
              "cities": ["Cerkno", "Bukovo", "Ledine"]
            },
            {
              "name": "Cerkvenjak",
              "cities": ["Cerkvenjak", "Andrenci", "Dragoslavec"]
            },
            {
              "name": "Crensovci",
              "cities": ["Črenšovci", "Dankovci", "Sotina"]
            },
            {
              "name": "Crna na Koroskem",
              "cities": ["Črna na Koroškem", "Mežica", "Prevalje"]
            },
            {
              "name": "Crnomelj",
              "cities": ["Črnomelj", "Vinica", "Dragatuš"]
            },
            {
              "name": "Destrnik",
              "cities": ["Destrnik", "Trnovci", "Sveti Gregor"]
            },
            {
              "name": "Divaca",
              "cities": ["Divača", "Lokev", "Vremski Britof"]
            },
            {
              "name": "Dobje",
              "cities": ["Dobje pri Planini", "Sevnica", "Podgorje"]
            },
            {
              "name": "Dobrepolje",
              "cities": ["Dobrepolje", "Videm", "Češence"]
            },
            {
              "name": "Dobrna",
              "cities": ["Dobrna", "Vojnik", "Zgornja Dobrna"]
            },
            {
              "name": "Dobrova-Horjul-Polhov Gradec",
              "cities": ["Dobrova", "Horjul", "Polhov Gradec"]
            },
            {
              "name": "Dobrovnik-Dobronak",
              "cities": ["Dobrovnik", "Turnišče", "Gornji Petrovci"]
            },
            {
              "name": "Dolenjske Toplice",
              "cities": ["Dolenjske Toplice", "Podturn", "Straža"]
            },
            {
              "name": "Dol pri Ljubljani",
              "cities": ["Dol pri Ljubljani", "Vir", "Iška"]
            },
            {
              "name": "Domzale",
              "cities": ["Domžale", "Vir", "Prevoje"]
            },
            {
              "name": "Dornava",
              "cities": ["Dornava", "Zgornja Korena", "Sveti Tomaž"]
            },
            {
              "name": "Dravograd",
              "cities": ["Dravograd", "Črneče", "Libeliče"]
            },
            {
              "name": "Duplek",
              "cities": ["Duplek", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Gorenja Vas-Poljane",
              "cities": ["Gorenja Vas", "Poljane", "Žiri"]
            },
            {
              "name": "Gorisnica",
              "cities": ["Gorišnica", "Muretinci", "Zamušani"]
            },
            {
              "name": "Gornja Radgona",
              "cities": ["Gornja Radgona", "Sveti Jurij", "Kapele"]
            },
            {
              "name": "Gornji Grad",
              "cities": ["Gornji Grad", "Luče", "Ojstrica"]
            },
            {
              "name": "Gornji Petrovci",
              "cities": ["Gornji Petrovci", "Hodoš", "Martjanci"]
            },
            {
              "name": "Grad",
              "cities": ["Grad", "Kobilje", "Razkrižje"]
            },
            {
              "name": "Grosuplje",
              "cities": ["Grosuplje", "Šmarje-Sap", "Bišče"]
            },
            {
              "name": "Hajdina",
              "cities": ["Hajdina", "Zgornji Duplek", "Kidričevo"]
            },
            {
              "name": "Hoce-Slivnica",
              "cities": ["Hoče", "Slivnica", "Maribor"]
            },
            {
              "name": "Hodos-Hodos",
              "cities": ["Hodoš", "Križevci", "Martjanci"]
            },
            {
              "name": "Horjul",
              "cities": ["Horjul", "Podgorje", "Polhov Gradec"]
            },
            {
              "name": "Hrastnik",
              "cities": ["Hrastnik", "Dol pri Hrastniku", "Kozje"]
            },
            {
              "name": "Hrpelje-Kozina",
              "cities": ["Hrpelje", "Kozina", "Podgorje"]
            },
            {
              "name": "Idrija",
              "cities": ["Idrija", "Spodnja Idrija", "Črni Vrh"]
            },
            {
              "name": "Ig",
              "cities": ["Ig", "Iška", "Iška Loka"]
            },
            {
              "name": "Ilirska Bistrica",
              "cities": ["Ilirska Bistrica", "Podgrad", "Snežnik"]
            },
            {
              "name": "Ivancna Gorica",
              "cities": ["Ivančna Gorica", "Višnja Gora", "Muljava"]
            },
            {
              "name": "Izola-Isola",
              "cities": ["Izola", "Koper", "Ankaran"]
            },
            {
              "name": "Jesenice",
              "cities": ["Jesenice", "Koroška Bela", "Blejska Dobrava"]
            },
            {
              "name": "Jezersko",
              "cities": ["Jezersko", "Zgornje Jezersko", "Spodnje Jezersko"]
            },
            {
              "name": "Jursinci",
              "cities": ["Jursinci", "Sveti Jurij", "Sveti Tomaž"]
            },
            {
              "name": "Kamnik",
              "cities": ["Kamnik", "Tuhinj", "Mekinje"]
            },
            {
              "name": "Kanal",
              "cities": ["Kanal", "Anhovo", "Plave"]
            },
            {
              "name": "Kidricevo",
              "cities": ["Kidričevo", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Kobarid",
              "cities": ["Kobarid", "Breginj", "Drežnica"]
            },
            {
              "name": "Kobilje",
              "cities": ["Kobilje", "Razkrižje", "Gornji Petrovci"]
            },
            {
              "name": "Kocevje",
              "cities": ["Kočevje", "Kočevska Reka", "Dolenjske Toplice"]
            },
            {
              "name": "Komen",
              "cities": ["Komen", "Štanjel", "Branik"]
            },
            {
              "name": "Komenda",
              "cities": ["Komenda", "Mengeš", "Domžale"]
            },
            {
              "name": "Koper-Capodistria",
              "cities": ["Koper", "Izola", "Ankaran"]
            },
            {
              "name": "Kostel",
              "cities": ["Kostel", "Vas", "Podlog"]
            },
            {
              "name": "Kozje",
              "cities": ["Kozje", "Pilštanj", "Bistrica ob Sotli"]
            },
            {
              "name": "Kranj",
              "cities": ["Kranj", "Naklo", "Kokrica"]
            },
            {
              "name": "Kranjska Gora",
              "cities": ["Kranjska Gora", "Gozd Martuljek", "Rateče"]
            },
            {
              "name": "Krizevci",
              "cities": ["Križevci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Krsko",
              "cities": ["Krško", "Senovo", "Raka"]
            },
            {
              "name": "Kungota",
              "cities": ["Kungota", "Zgornja Kungota", "Spodnja Kungota"]
            },
            {
              "name": "Kuzma",
              "cities": ["Kuzma", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Lasko",
              "cities": ["Laško", "Rimske Toplice", "Jurklošter"]
            },
            {
              "name": "Lenart",
              "cities": ["Lenart", "Sveti Jurij", "Sveti Tomaž"]
            },
            {
              "name": "Lendava-Lendva",
              "cities": ["Lendava", "Dolga Vas", "Gaberje"]
            },
            {
              "name": "Litija",
              "cities": ["Litija", "Sava", "Kresnice"]
            },
            {
              "name": "Ljubljana",
              "cities": ["Ljubljana", "Šiška", "Bežigrad"]
            },
            {
              "name": "Ljubno",
              "cities": ["Ljubno", "Lokve", "Luče"]
            },
            {
              "name": "Ljutomer",
              "cities": ["Ljutomer", "Murska Sobota", "Radenci"]
            },
            {
              "name": "Logatec",
              "cities": ["Logatec", "Hotedršica", "Rovte"]
            },
            {
              "name": "Loska Dolina",
              "cities": ["Loška Dolina", "Stari Trg", "Podgorje"]
            },
            {
              "name": "Loski Potok",
              "cities": ["Loški Potok", "Velike Lašče", "Podgorje"]
            },
            {
              "name": "Lovrenc na Pohorju",
              "cities": ["Lovrenc na Pohorju", "Ribnica na Pohorju", "Zgornja Ložnica"]
            },
            {
              "name": "Luce",
              "cities": ["Luče", "Gornji Grad", "Ojstrica"]
            },
            {
              "name": "Lukovica",
              "cities": ["Lukovica", "Blagovica", "Prevalje"]
            },
            {
              "name": "Majsperk",
              "cities": ["Majšperk", "Ptuj", "Zgornja Korena"]
            },
            {
              "name": "Maribor",
              "cities": ["Maribor", "Pobrežje", "Tabor"]
            },
            {
              "name": "Markovci",
              "cities": ["Markovci", "Sveti Jurij", "Sveti Tomaž"]
            },
            {
              "name": "Medvode",
              "cities": ["Medvode", "Smlednik", "Zgornja Senica"]
            },
            {
              "name": "Menges",
              "cities": ["Mengeš", "Domžale", "Prevoje"]
            },
            {
              "name": "Metlika",
              "cities": ["Metlika", "Semič", "Črnomelj"]
            },
            {
              "name": "Mezica",
              "cities": ["Mežica", "Prevalje", "Ravne na Koroškem"]
            },
            {
              "name": "Miklavz na Dravskem Polju",
              "cities": ["Miklavž na Dravskem Polju", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Miren-Kostanjevica",
              "cities": ["Miren", "Kostanjevica na Krasu", "Branik"]
            },
            {
              "name": "Mirna Pec",
              "cities": ["Mirna Peč", "Črnomelj", "Semič"]
            },
            {
              "name": "Mislinja",
              "cities": ["Mislinja", "Dravograd", "Vuzenica"]
            },
            {
              "name": "Moravce",
              "cities": ["Moravče", "Dobrepolje", "Šentvid"]
            },
            {
              "name": "Moravske Toplice",
              "cities": ["Moravske Toplice", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Mozirje",
              "cities": ["Mozirje", "Nazarje", "Šmartno ob Dreti"]
            },
            {
              "name": "Murska Sobota",
              "cities": ["Murska Sobota", "Lendava", "Radenci"]
            },
            {
              "name": "Muta",
              "cities": ["Muta", "Dravograd", "Vuzenica"]
            },
            {
              "name": "Naklo",
              "cities": ["Naklo", "Kokrica", "Kranj"]
            },
            {
              "name": "Nazarje",
              "cities": ["Nazarje", "Šmartno ob Dreti", "Mozirje"]
            },
            {
              "name": "Nova Gorica",
              "cities": ["Nova Gorica", "Kromberk", "Renče"]
            },
            {
              "name": "Novo Mesto",
              "cities": ["Novo Mesto", "Otočec", "Straža"]
            },
            {
              "name": "Odranci",
              "cities": ["Odranci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Oplotnica",
              "cities": ["Oplotnica", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Ormoz",
              "cities": ["Ormož", "Gorišnica", "Zgornja Korena"]
            },
            {
              "name": "Osilnica",
              "cities": ["Osilnica", "Kočevje", "Ribnica"]
            },
            {
              "name": "Pesnica",
              "cities": ["Pesnica", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Piran-Pirano",
              "cities": ["Piran", "Portorož", "Sečovlje"]
            },
            {
              "name": "Pivka",
              "cities": ["Pivka", "Košana", "Nova Vas"]
            },
            {
              "name": "Podcetrtek",
              "cities": ["Podčetrtek", "Rogaška Slatina", "Bistrica ob Sotli"]
            },
            {
              "name": "Podlehnik",
              "cities": ["Podlehnik", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Podvelka",
              "cities": ["Podvelka", "Ribnica na Pohorju", "Lovrenc na Pohorju"]
            },
            {
              "name": "Polzela",
              "cities": ["Polzela", "Šempeter", "Vojnik"]
            },
            {
              "name": "Postojna",
              "cities": ["Postojna", "Planina", "Pivka"]
            },
            {
              "name": "Prebold",
              "cities": ["Prebold", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Preddvor",
              "cities": ["Preddvor", "Kokrica", "Kranj"]
            },
            {
              "name": "Prevalje",
              "cities": ["Prevalje", "Ravne na Koroškem", "Mežica"]
            },
            {
              "name": "Ptuj",
              "cities": ["Ptuj", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Puconci",
              "cities": ["Puconci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Race-Fram",
              "cities": ["Rače", "Fram", "Zgornja Korena"]
            },
            {
              "name": "Radece",
              "cities": ["Radeče", "Zidani Most", "Laško"]
            },
            {
              "name": "Radenci",
              "cities": ["Radenci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Radlje ob Dravi",
              "cities": ["Radlje ob Dravi", "Dravograd", "Vuzenica"]
            },
            {
              "name": "Radovljica",
              "cities": ["Radovljica", "Lesce", "Begunje"]
            },
            {
              "name": "Ravne na Koroskem",
              "cities": ["Ravne na Koroškem", "Prevalje", "Mežica"]
            },
            {
              "name": "Razkrizje",
              "cities": ["Razkrižje", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Ribnica",
              "cities": ["Ribnica", "Kočevje", "Dolenjske Toplice"]
            },
            {
              "name": "Ribnica na Pohorju",
              "cities": ["Ribnica na Pohorju", "Lovrenc na Pohorju", "Podvelka"]
            },
            {
              "name": "Rogasovci",
              "cities": ["Rogašovci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Rogaska Slatina",
              "cities": ["Rogaška Slatina", "Podčetrtek", "Bistrica ob Sotli"]
            },
            {
              "name": "Rogatec",
              "cities": ["Rogatec", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Ruse",
              "cities": ["Ruše", "Maribor", "Pesnica"]
            },
            {
              "name": "Salovci",
              "cities": ["Šalovci", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Selnica ob Dravi",
              "cities": ["Selnica ob Dravi", "Dravograd", "Vuzenica"]
            },
            {
              "name": "Semic",
              "cities": ["Semič", "Črnomelj", "Metlika"]
            },
            {
              "name": "Sempeter-Vrtojba",
              "cities": ["Šempeter pri Gorici", "Vrtojba", "Nova Gorica"]
            },
            {
              "name": "Sencur",
              "cities": ["Šenčur", "Kranj", "Naklo"]
            },
            {
              "name": "Sentilj",
              "cities": ["Šentilj", "Pesnica", "Zgornja Korena"]
            },
            {
              "name": "Sentjernej",
              "cities": ["Šentjernej", "Črnomelj", "Semič"]
            },
            {
              "name": "Sentjur pri Celju",
              "cities": ["Šentjur pri Celju", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Sevnica",
              "cities": ["Sevnica", "Zidani Most", "Laško"]
            },
            {
              "name": "Sezana",
              "cities": ["Sežana", "Komen", "Divača"]
            },
            {
              "name": "Skocjan",
              "cities": ["Škocjan", "Črnomelj", "Semič"]
            },
            {
              "name": "Skofja Loka",
              "cities": ["Škofja Loka", "Kranj", "Gorenja Vas"]
            },
            {
              "name": "Skofljica",
              "cities": ["Škofljica", "Ljubljana", "Ig"]
            },
            {
              "name": "Slovenj Gradec",
              "cities": ["Slovenj Gradec", "Ravne na Koroškem", "Prevalje"]
            },
            {
              "name": "Slovenska Bistrica",
              "cities": ["Slovenska Bistrica", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Slovenske Konjice",
              "cities": ["Slovenske Konjice", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Smarje pri Jelsah",
              "cities": ["Šmarje pri Jelšah", "Rogaška Slatina", "Bistrica ob Sotli"]
            },
            {
              "name": "Smartno ob Paki",
              "cities": ["Šmartno ob Paki", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Smartno pri Litiji",
              "cities": ["Šmartno pri Litiji", "Litija", "Kresnice"]
            },
            {
              "name": "Sodrazica",
              "cities": ["Sodražica", "Ribnica", "Kočevje"]
            },
            {
              "name": "Solcava",
              "cities": ["Solčava", "Luče", "Gornji Grad"]
            },
            {
              "name": "Sostanj",
              "cities": ["Šoštanj", "Velenje", "Zgornja Korena"]
            },
            {
              "name": "Starse",
              "cities": ["Starše", "Pesnica", "Zgornja Korena"]
            },
            {
              "name": "Store",
              "cities": ["Store", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Sveta Ana",
              "cities": ["Sveta Ana", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Sveti Andraz v Slovenskih Goricah",
              "cities": ["Sveti Andraž v Slovenskih Goricah", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Sveti Jurij",
              "cities": ["Sveti Jurij", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Tabor",
              "cities": ["Tabor", "Maribor", "Pesnica"]
            },
            {
              "name": "Tisina",
              "cities": ["Tišina", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Tolmin",
              "cities": ["Tolmin", "Kobarid", "Bovec"]
            },
            {
              "name": "Trbovlje",
              "cities": ["Trbovlje", "Zagorje ob Savi", "Hrastnik"]
            },
            {
              "name": "Trebnje",
              "cities": ["Trebnje", "Novo Mesto", "Šentjernej"]
            },
            {
              "name": "Trnovska Vas",
              "cities": ["Trnovska Vas", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Trzic",
              "cities": ["Tržič", "Kranj", "Bistrica"]
            },
            {
              "name": "Trzin",
              "cities": ["Trzin", "Domžale", "Mengeš"]
            },
            {
              "name": "Turnisce",
              "cities": ["Turnišče", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Velenje",
              "cities": ["Velenje", "Šoštanj", "Zgornja Korena"]
            },
            {
              "name": "Velika Polana",
              "cities": ["Velika Polana", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Velike Lasce",
              "cities": ["Velike Lašče", "Ribnica", "Kočevje"]
            },
            {
              "name": "Verzej",
              "cities": ["Veržej", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Videm",
              "cities": ["Videm", "Ptuj", "Zgornja Korena"]
            },
            {
              "name": "Vipava",
              "cities": ["Vipava", "Ajdovščina", "Šturje"]
            },
            {
              "name": "Vitanje",
              "cities": ["Vitanje", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Vodice",
              "cities": ["Vodice", "Ljubljana", "Ig"]
            },
            {
              "name": "Vojnik",
              "cities": ["Vojnik", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Vransko",
              "cities": ["Vransko", "Zgornja Korena", "Spodnja Korena"]
            },
            {
              "name": "Vrhnika",
              "cities": ["Vrhnika", "Logatec", "Rovte"]
            },
            {
              "name": "Vuzenica",
              "cities": ["Vuzenica", "Dravograd", "Radlje ob Dravi"]
            },
            {
              "name": "Zagorje ob Savi",
              "cities": ["Zagorje ob Savi", "Trbovlje", "Hrastnik"]
            },
            {
              "name": "Zalec",
              "cities": ["Žalec", "Laško", "Zgornja Korena"]
            },
            {
              "name": "Zavrc",
              "cities": ["Zavrč", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Zelezniki",
              "cities": ["Železniki", "Škofja Loka", "Gorenja Vas"]
            },
            {
              "name": "Zetale",
              "cities": ["Zetale", "Gornji Petrovci", "Hodoš"]
            },
            {
              "name": "Ziri",
              "cities": ["Žiri", "Škofja Loka", "Gorenja Vas"]
            },
            {
              "name": "Zirovnica",
              "cities": ["Žirovnica", "Kranj", "Bled"]
            },
            {
              "name": "Zuzemberk",
              "cities": ["Žužemberk", "Novo Mesto", "Dolenjske Toplice"]
            },
            {
              "name": "Zrece",
              "cities": ["Zreče", "Velenje", "Šoštanj"]
            }
          ]
        },

        {
          "country": "Solomon Islands",
          "states": [
            {
              "name": "Central",
              "cities": ["Honiara"]
            },
            {
              "name": "Choiseul",
              "cities": []
            },
            {
              "name": "Guadalcanal",
              "cities": []
            },
            {
              "name": "Honiara",
              "cities": ["Honiara"]
            },
            {
              "name": "Isabel",
              "cities": []
            },
            {
              "name": "Makira",
              "cities": []
            },
            {
              "name": "Malaita",
              "cities": []
            },
            {
              "name": "Rennell and Bellona",
              "cities": []
            },
            {
              "name": "Temotu",
              "cities": []
            },
            {
              "name": "Western",
              "cities": []
            }
          ]
        },
        {
          "country": "Somalia",
          "states": [
            {
              "name": "Awdal",
              "cities": ["Borama"]
            },
            {
              "name": "Bakool",
              "cities": ["Xuddur"]
            },
            {
              "name": "Banaadir",
              "cities": ["Mogadishu"]
            },
            {
              "name": "Bari",
              "cities": ["Bosaso"]
            },
            {
              "name": "Bay",
              "cities": ["Baidoa"]
            },
            {
              "name": "Galguduud",
              "cities": ["Dhusamareb"]
            },
            {
              "name": "Gedo",
              "cities": ["Garbaharey"]
            },
            {
              "name": "Hiiraan",
              "cities": ["Beledweyne"]
            },
            {
              "name": "Jubbada Dhexe",
              "cities": ["Jilib"]
            },
            {
              "name": "Jubbada Hoose",
              "cities": ["Kismayo"]
            },
            {
              "name": "Mudug",
              "cities": ["Galkayo"]
            },
            {
              "name": "Nugaal",
              "cities": ["Garowe"]
            },
            {
              "name": "Sanaag",
              "cities": ["Erigavo"]
            },
            {
              "name": "Shabeellaha Dhexe",
              "cities": ["Jowhar"]
            },
            {
              "name": "Shabeellaha Hoose",
              "cities": ["Afgoye"]
            },
            {
              "name": "Sool",
              "cities": ["Laascaanood"]
            },
            {
              "name": "Togdheer",
              "cities": ["Burao"]
            },
            {
              "name": "Woqooyi Galbeed",
              "cities": ["Hargeisa"]
            }
          ]
        },
        {
          "country": "South Africa",
          "states": [
            {
              "name": "Eastern Cape",
              "cities": ["Port Elizabeth", "East London", "Grahamstown"]
            },
            {
              "name": "Free State",
              "cities": ["Bloemfontein", "Welkom", "QwaQwa"]
            },
            {
              "name": "Gauteng",
              "cities": ["Johannesburg", "Pretoria", "Vanderbijlpark"]
            },
            {
              "name": "KwaZulu-Natal",
              "cities": ["Durban", "Pietermaritzburg", "Richards Bay"]
            },
            {
              "name": "Limpopo",
              "cities": ["Polokwane", "Tzaneen", "Makhado"]
            },
            {
              "name": "Mpumalanga",
              "cities": ["Nelspruit", "Witbank", "Secunda"]
            },
            {
              "name": "North-West",
              "cities": ["Mahikeng", "Klerksdorp", "Potchefstroom"]
            },
            {
              "name": "Northern Cape",
              "cities": ["Kimberley", "Upington", "Postmasburg"]
            },
            {
              "name": "Western Cape",
              "cities": ["Cape Town", "Stellenbosch", "George"]
            }
          ]
        },
        {
          "country": "Spain",
          "states": [
            {
              "name": "Andalucia",
              "cities": ["Seville", "Malaga", "Granada"]
            },
            {
              "name": "Aragon",
              "cities": ["Zaragoza", "Huesca", "Teruel"]
            },
            {
              "name": "Asturias",
              "cities": ["Oviedo", "Gijón", "Avilés"]
            },
            {
              "name": "Baleares",
              "cities": ["Palma de Mallorca", "Ibiza", "Mahón"]
            },
            {
              "name": "Ceuta",
              "cities": ["Ceuta"]
            },
            {
              "name": "Canarias",
              "cities": ["Las Palmas de Gran Canaria", "Santa Cruz de Tenerife"]
            },
            {
              "name": "Cantabria",
              "cities": ["Santander", "Torrelavega", "Castro Urdiales"]
            },
            {
              "name": "Castilla-La Mancha",
              "cities": ["Toledo", "Albacete", "Cuenca"]
            },
            {
              "name": "Castilla y Leon",
              "cities": ["Valladolid", "Salamanca", "Burgos"]
            },
            {
              "name": "Cataluna",
              "cities": ["Barcelona", "Girona", "Tarragona"]
            },
            {
              "name": "Comunidad Valenciana",
              "cities": ["Valencia", "Alicante", "Castellón"]
            },
            {
              "name": "Extremadura",
              "cities": ["Mérida", "Badajoz", "Cáceres"]
            },
            {
              "name": "Galicia",
              "cities": ["Santiago de Compostela", "A Coruña", "Vigo"]
            },
            {
              "name": "La Rioja",
              "cities": ["Logroño", "Calahorra", "Arnedo"]
            },
            {
              "name": "Madrid",
              "cities": ["Madrid", "Alcalá de Henares", "Getafe"]
            },
            {
              "name": "Melilla",
              "cities": ["Melilla"]
            },
            {
              "name": "Murcia",
              "cities": ["Murcia", "Cartagena", "Lorca"]
            },
            {
              "name": "Navarra",
              "cities": ["Pamplona", "Tudela", "Estella"]
            },
            {
              "name": "Pais Vasco",
              "cities": ["Bilbao", "San Sebastián", "Vitoria"]
            }
          ]
        },
        {
          "country": "Sri Lanka",
          "states": [
            {
              "name": "Central",
              "cities": ["Kandy", "Nuwara Eliya", "Matale"]
            },
            {
              "name": "North Central",
              "cities": ["Anuradhapura", "Polonnaruwa"]
            },
            {
              "name": "North Eastern",
              "cities": ["Trincomalee", "Batticaloa", "Ampara"]
            },
            {
              "name": "North Western",
              "cities": ["Kurunegala", "Negombo", "Puttalam"]
            },
            {
              "name": "Sabaragamuwa",
              "cities": ["Ratnapura", "Kegalle"]
            },
            {
              "name": "Southern",
              "cities": ["Galle", "Matara", "Hambantota"]
            },
            {
              "name": "Uva",
              "cities": ["Badulla", "Monaragala"]
            },
            {
              "name": "Western",
              "cities": ["Colombo", "Kotte", "Negombo"]
            }
          ]
        },
        {
          "country": "Sudan",
          "states": [
            {
              "name": "A'ali an Nil",
              "cities": ["Ed Damer", "Shendi"]
            },
            {
              "name": "Al Bahr al Ahmar",
              "cities": ["Port Sudan", "Suakin"]
            },
            {
              "name": "Al Buhayrat",
              "cities": ["Shaybah"]
            },
            {
              "name": "Al Jazirah",
              "cities": ["Al Hasaheisa", "Khasm El Girba"]
            },
            {
              "name": "Al Khartum",
              "cities": ["Khartoum", "Omdurman", "Khartoum North"]
            },
            {
              "name": "Al Qadarif",
              "cities": ["Qadarif"]
            },
            {
              "name": "Al Wahdah",
              "cities": ["Renk", "Abu Jubeiha"]
            },
            {
              "name": "An Nil al Abyad",
              "cities": ["Kosti"]
            },
            {
              "name": "An Nil al Azraq",
              "cities": ["Damazin"]
            },
            {
              "name": "Ash Shamaliyah",
              "cities": ["Wadi Halfa"]
            },
            {
              "name": "Bahr al Jabal",
              "cities": ["Juba", "Wau"]
            },
            {
              "name": "Gharb al Istiwa'iyah",
              "cities": ["Malakal"]
            },
            {
              "name": "Gharb Bahr al Ghazal",
              "cities": ["Wau"]
            },
            {
              "name": "Gharb Darfur",
              "cities": ["El Geneina"]
            },
            {
              "name": "Gharb Kurdufan",
              "cities": ["El Obeid"]
            },
            {
              "name": "Janub Darfur",
              "cities": ["Nyala"]
            },
            {
              "name": "Janub Kurdufan",
              "cities": ["Kadugli"]
            },
            {
              "name": "Junqali",
              "cities": ["Malakal"]
            },
            {
              "name": "Kassala",
              "cities": ["Kassala"]
            },
            {
              "name": "Nahr an Nil",
              "cities": ["Dongola"]
            },
            {
              "name": "Shamal Bahr al Ghazal",
              "cities": ["Wau"]
            },
            {
              "name": "Shamal Darfur",
              "cities": ["El Fasher"]
            },
            {
              "name": "Shamal Kurdufan",
              "cities": ["El Obeid"]
            },
            {
              "name": "Sharq al Istiwa'iyah",
              "cities": ["Port Sudan"]
            },
            {
              "name": "Sinnar",
              "cities": ["Sinnar"]
            },
            {
              "name": "Warab",
              "cities": ["Aweil"]
            }
          ]
        },
        {
          "country": "Suriname",
          "states": [
            {
              "name": "Brokopondo",
              "cities": ["Brokopondo", "Boven Suriname"]
            },
            {
              "name": "Commewijne",
              "cities": ["Nieuw Amsterdam", "Mariënburg"]
            },
            {
              "name": "Coronie",
              "cities": ["New Aurora"]
            },
            {
              "name": "Marowijne",
              "cities": ["Albina", "Moengo"]
            },
            {
              "name": "Nickerie",
              "cities": ["Nieuw Nickerie"]
            },
            {
              "name": "Para",
              "cities": ["Para", "Meerzorg"]
            },
            {
              "name": "Paramaribo",
              "cities": ["Paramaribo"]
            },
            {
              "name": "Saramacca",
              "cities": ["Lelydorp", "Meerzorg"]
            },
            {
              "name": "Sipaliwini",
              "cities": ["St. Laurent", "Palumeu"]
            },
            {
              "name": "Wanica",
              "cities": ["Papenburg", "Kwatta"]
            }
          ]
        },
        {
          "country": "Swaziland",
          "states": [
            {
              "name": "Hhohho",
              "cities": ["Mbabane", "Pigg's Peak"]
            },
            {
              "name": "Lubombo",
              "cities": ["Siteki", "Big Bend"]
            },
            {
              "name": "Manzini",
              "cities": ["Manzini"]
            },
            {
              "name": "Shiselweni",
              "cities": ["Nhlangano"]
            }
          ]
        },
        {
          "country": "Sweden",
          "states": [
            {
              "name": "Blekinge",
              "cities": ["Karlskrona", "Ronneby"]
            },
            {
              "name": "Dalarnas",
              "cities": ["Falun", "Borlange"]
            },
            {
              "name": "Gavleborgs",
              "cities": ["Gävle", "Sundsvall"]
            },
            {
              "name": "Gotlands",
              "cities": ["Visby"]
            },
            {
              "name": "Hallands",
              "cities": ["Halmstad", "Varberg"]
            },
            {
              "name": "Jamtlands",
              "cities": ["Ostersund"]
            },
            {
              "name": "Jonkopings",
              "cities": ["Jonkoping", "Vaggeryd"]
            },
            {
              "name": "Kalmar",
              "cities": ["Kalmar", "Vastervik"]
            },
            {
              "name": "Kronobergs",
              "cities": ["Växjö", "Alvesta"]
            },
            {
              "name": "Norrbottens",
              "cities": ["Luleå", "Kiruna"]
            },
            {
              "name": "Orebro",
              "cities": ["Örebro", "Hallsberg"]
            },
            {
              "name": "Ostergotlands",
              "cities": ["Linköping", "Norrköping"]
            },
            {
              "name": "Skane",
              "cities": ["Malmö", "Lund"]
            },
            {
              "name": "Sodermanlands",
              "cities": ["Eskilstuna", "Nyköping"]
            },
            {
              "name": "Stockholms",
              "cities": ["Stockholm", "Sundbyberg"]
            },
            {
              "name": "Uppsala",
              "cities": ["Uppsala"]
            },
            {
              "name": "Varmlands",
              "cities": ["Karlstad"]
            },
            {
              "name": "Vasterbottens",
              "cities": ["Umeå", "Skellefteå"]
            },
            {
              "name": "Vasternorrlands",
              "cities": ["Östersund", "Härnösand"]
            },
            {
              "name": "Vastmanlands",
              "cities": ["Västerås", "Hallstahammar"]
            },
            {
              "name": "Vastra Gotalands",
              "cities": ["Gothenburg", "Borås"]
            }
          ]
        },
        {
          "country": "Switzerland",
          "states": [
            {
              "name": "Aargau",
              "cities": ["Aarau", "Baden", "Wettingen", "Zofingen"]
            },
            {
              "name": "Appenzell Ausser-Rhoden",
              "cities": ["Herisau", "Trogen", "Heiden"]
            },
            {
              "name": "Appenzell Inner-Rhoden",
              "cities": ["Appenzell", "Gonten", "Schlatt-Haslen"]
            },
            {
              "name": "Basel-Landschaft",
              "cities": ["Liestal", "Allschwil", "Reinach", "Sissach"]
            },
            {
              "name": "Basel-Stadt",
              "cities": ["Basel", "Riehen", "Bettingen"]
            },
            {
              "name": "Bern",
              "cities": ["Bern", "Thun", "Biel/Bienne", "Interlaken"]
            },
            {
              "name": "Fribourg",
              "cities": ["Fribourg", "Bulle", "Murten", "Estavayer-le-Lac"]
            },
            {
              "name": "Geneve",
              "cities": ["Geneva", "Carouge", "Vernier", "Lancy"]
            },
            {
              "name": "Glarus",
              "cities": ["Glarus", "Näfels", "Schwanden"]
            },
            {
              "name": "Graubunden",
              "cities": ["Chur", "Davos", "St. Moritz", "Arosa"]
            },
            {
              "name": "Jura",
              "cities": ["Delémont", "Porrentruy", "Saignelégier"]
            },
            {
              "name": "Luzern",
              "cities": ["Lucerne", "Emmen", "Kriens", "Horw"]
            },
            {
              "name": "Neuchatel",
              "cities": ["Neuchâtel", "La Chaux-de-Fonds", "Le Locle", "Val-de-Travers"]
            },
            {
              "name": "Nidwalden",
              "cities": ["Stans", "Hergiswil", "Buochs", "Ennetbürgen"]
            },
            {
              "name": "Obwalden",
              "cities": ["Sarnen", "Kerns", "Alpnach", "Engelberg"]
            },
            {
              "name": "Sankt Gallen",
              "cities": ["St. Gallen", "Rapperswil-Jona", "Wil", "Gossau"]
            },
            {
              "name": "Schaffhausen",
              "cities": ["Schaffhausen", "Neuhausen am Rheinfall", "Thayngen"]
            },
            {
              "name": "Schwyz",
              "cities": ["Schwyz", "Einsiedeln", "Küssnacht", "Brunnen"]
            },
            {
              "name": "Solothurn",
              "cities": ["Solothurn", "Olten", "Grenchen", "Biberist"]
            },
            {
              "name": "Thurgau",
              "cities": ["Frauenfeld", "Kreuzlingen", "Arbon", "Weinfelden"]
            },
            {
              "name": "Ticino",
              "cities": ["Lugano", "Bellinzona", "Locarno", "Mendrisio"]
            },
            {
              "name": "Uri",
              "cities": ["Altdorf", "Schattdorf", "Bürglen", "Erstfeld"]
            },
            {
              "name": "Valais",
              "cities": ["Sion", "Martigny", "Monthey", "Brig-Glis"]
            },
            {
              "name": "Vaud",
              "cities": ["Lausanne", "Montreux", "Yverdon-les-Bains", "Nyon"]
            },
            {
              "name": "Zug",
              "cities": ["Zug", "Baar", "Cham", "Unterägeri"]
            },
            {
              "name": "Zurich",
              "cities": ["Zurich", "Winterthur", "Uster", "Dübendorf"]
            }
          ]
        },
        {
          "country": "Syria",
          "states": [
            {
              "name": "Al Hasakah",
              "cities": ["Al Hasakah", "Qamishli", "Ras al-Ayn"]
            },
            {
              "name": "Al Ladhiqiyah",
              "cities": ["Latakia", "Jableh", "Qardaha"]
            },
            {
              "name": "Al Qunaytirah",
              "cities": ["Quneitra", "Khan Arnabah", "Al-Rafid"]
            },
            {
              "name": "Ar Raqqah",
              "cities": ["Raqqa", "Al-Thawrah", "Al-Mansurah"]
            },
            {
              "name": "As Suwayda'",
              "cities": ["As-Suwayda", "Salkhad", "Shahba"]
            },
            {
              "name": "Dar'a",
              "cities": ["Daraa", "Al-Sanamayn", "Izra'"]
            },
            {
              "name": "Dayr az Zawr",
              "cities": ["Deir ez-Zor", "Al-Mayadin", "Abu Kamal"]
            },
            {
              "name": "Dimashq",
              "cities": ["Damascus", "Douma", "Darayya"]
            },
            {
              "name": "Halab",
              "cities": ["Aleppo", "Manbij", "Al-Bab"]
            },
            {
              "name": "Hamah",
              "cities": ["Hama", "Salamiyah", "Masyaf"]
            },
            {
              "name": "Hims",
              "cities": ["Homs", "Tadmur", "Al-Qusayr"]
            },
            {
              "name": "Idlib",
              "cities": ["Idlib", "Jisr al-Shughur", "Ariha"]
            },
            {
              "name": "Rif Dimashq",
              "cities": ["Douma", "Darayya", "Zabadani"]
            },
            {
              "name": "Tartus",
              "cities": ["Tartus", "Baniyas", "Safita"]
            }
          ]
        },
        {
          "country": "Taiwan",
          "states": [
            {
              "name": "Chang-hua",
              "cities": ["Changhua", "Yuanlin", "Lukang"]
            },
            {
              "name": "Chia-i",
              "cities": ["Chiayi", "Puzi", "Budai"]
            },
            {
              "name": "Hsin-chu",
              "cities": ["Hsinchu", "Zhubei", "Xinfeng"]
            },
            {
              "name": "Hua-lien",
              "cities": ["Hualien", "Yuli", "Guangfu"]
            },
            {
              "name": "I-lan",
              "cities": ["Yilan", "Luodong", "Jiaoxi"]
            },
            {
              "name": "Kao-hsiung",
              "cities": ["Kaohsiung", "Fengshan", "Gangshan"]
            },
            {
              "name": "Kin-men",
              "cities": ["Jincheng", "Jinsha", "Jinning"]
            },
            {
              "name": "Lien-chiang",
              "cities": ["Nangan", "Beigan", "Dongyin"]
            },
            {
              "name": "Miao-li",
              "cities": ["Miaoli", "Toufen", "Zhunan"]
            },
            {
              "name": "Nan-t'ou",
              "cities": ["Nantou", "Puli", "Caotun"]
            },
            {
              "name": "P'eng-hu",
              "cities": ["Magong", "Baisha", "Xiyu"]
            },
            {
              "name": "P'ing-tung",
              "cities": ["Pingtung", "Chaozhou", "Donggang"]
            },
            {
              "name": "T'ai-chung",
              "cities": ["Taichung", "Fengyuan", "Dali"]
            },
            {
              "name": "T'ai-nan",
              "cities": ["Tainan", "Yongkang", "Xinying"]
            },
            {
              "name": "T'ai-pei",
              "cities": ["Taipei", "Banqiao", "Xindian"]
            },
            {
              "name": "T'ai-tung",
              "cities": ["Taitung", "Chenggong", "Lüdao"]
            },
            {
              "name": "T'ao-yuan",
              "cities": ["Taoyuan", "Zhongli", "Pingzhen"]
            },
            {
              "name": "Yun-lin",
              "cities": ["Douliu", "Huwei", "Beigang"]
            },
            {
              "name": "Chia-i",
              "cities": ["Chiayi", "Puzi", "Budai"]
            },
            {
              "name": "Chi-lung",
              "cities": ["Keelung", "Zhongzheng", "Nuannuan"]
            },
            {
              "name": "Hsin-chu",
              "cities": ["Hsinchu", "Zhubei", "Xinfeng"]
            },
            {
              "name": "T'ai-chung",
              "cities": ["Taichung", "Fengyuan", "Dali"]
            },
            {
              "name": "T'ai-nan",
              "cities": ["Tainan", "Yongkang", "Xinying"]
            },
            {
              "name": "Kao-hsiung city",
              "cities": ["Kaohsiung", "Fengshan", "Gangshan"]
            },
            {
              "name": "T'ai-pei city",
              "cities": ["Taipei", "Banqiao", "Xindian"]
            }
          ]
        },
        {
          "country": "Tajikistan",
          "states": []
        },
        {
          "country": "Tanzania",
          "states": [
            {
              "name": "Arusha",
              "cities": ["Arusha", "Moshi", "Karatu"]
            },
            {
              "name": "Dar es Salaam",
              "cities": ["Dar es Salaam", "Kigamboni", "Ubungo"]
            },
            {
              "name": "Dodoma",
              "cities": ["Dodoma", "Kondoa", "Mpwapwa"]
            },
            {
              "name": "Iringa",
              "cities": ["Iringa", "Mafinga", "Njombe"]
            },
            {
              "name": "Kagera",
              "cities": ["Bukoba", "Muleba", "Karagwe"]
            },
            {
              "name": "Kigoma",
              "cities": ["Kigoma", "Kasulu", "Ujiji"]
            },
            {
              "name": "Kilimanjaro",
              "cities": ["Moshi", "Himo", "Rombo"]
            },
            {
              "name": "Lindi",
              "cities": ["Lindi", "Kilwa Masoko", "Nachingwea"]
            },
            {
              "name": "Manyara",
              "cities": ["Babati", "Hanang", "Kiteto"]
            },
            {
              "name": "Mara",
              "cities": ["Musoma", "Tarime", "Bunda"]
            },
            {
              "name": "Mbeya",
              "cities": ["Mbeya", "Tukuyu", "Chunya"]
            },
            {
              "name": "Morogoro",
              "cities": ["Morogoro", "Ifakara", "Kilosa"]
            },
            {
              "name": "Mtwara",
              "cities": ["Mtwara", "Masasi", "Newala"]
            },
            {
              "name": "Mwanza",
              "cities": ["Mwanza", "Sengerema", "Geita"]
            },
            {
              "name": "Pemba North",
              "cities": ["Wete", "Konde", "Micheweni"]
            },
            {
              "name": "Pemba South",
              "cities": ["Chake Chake", "Mkoani", "Wawi"]
            },
            {
              "name": "Pwani",
              "cities": ["Kibaha", "Bagamoyo", "Rufiji"]
            },
            {
              "name": "Rukwa",
              "cities": ["Sumbawanga", "Nkasi", "Kalambo"]
            },
            {
              "name": "Ruvuma",
              "cities": ["Songea", "Tunduru", "Namtumbo"]
            },
            {
              "name": "Shinyanga",
              "cities": ["Shinyanga", "Kahama", "Kishapu"]
            },
            {
              "name": "Singida",
              "cities": ["Singida", "Manyoni", "Ikungi"]
            },
            {
              "name": "Tabora",
              "cities": ["Tabora", "Urambo", "Igunga"]
            },
            {
              "name": "Tanga",
              "cities": ["Tanga", "Muheza", "Lushoto"]
            },
            {
              "name": "Zanzibar Central/South",
              "cities": ["Koani", "Mwanakwerekwe", "Dole"]
            },
            {
              "name": "Zanzibar North",
              "cities": ["Mkokotoni", "Tumbatu", "Nungwi"]
            },
            {
              "name": "Zanzibar Urban/West",
              "cities": ["Zanzibar City", "Mwanakwerekwe", "Mtoni"]
            }
          ]
        },

        {
          "country": "Thailand",
          "states": [
            {
              "name": "Amnat Charoen",
              "cities": ["Amnat Charoen", "Hua Taphan", "Pathum Ratchawongsa", "Phana"]
            },
            {
              "name": "Ang Thong",
              "cities": ["Ang Thong", "Chaiyo", "Pa Mok", "Sawaeng Ha"]
            },
            {
              "name": "Buriram",
              "cities": ["Buriram", "Prakhon Chai", "Nang Rong", "Lahan Sai"]
            },
            {
              "name": "Chachoengsao",
              "cities": ["Chachoengsao", "Bang Khla", "Bang Pakong", "Phanom Sarakham"]
            },
            {
              "name": "Chai Nat",
              "cities": ["Chai Nat", "Sankhaburi", "Manorom", "Hankha"]
            },
            {
              "name": "Chaiyaphum",
              "cities": ["Chaiyaphum", "Ban Khwao", "Kaeng Khro", "Nong Bua Daeng"]
            },
            {
              "name": "Chanthaburi",
              "cities": ["Chanthaburi", "Khlung", "Laem Sing", "Tha Mai"]
            },
            {
              "name": "Chiang Mai",
              "cities": ["Chiang Mai", "Mae Rim", "San Kamphaeng", "Hang Dong"]
            },
            {
              "name": "Chiang Rai",
              "cities": ["Chiang Rai", "Mae Sai", "Phan", "Thoeng"]
            },
            {
              "name": "Chon Buri",
              "cities": ["Chon Buri", "Pattaya", "Si Racha", "Bang Saen"]
            },
            {
              "name": "Chumphon",
              "cities": ["Chumphon", "Thung Tako", "Pathio", "Lang Suan"]
            },
            {
              "name": "Kalasin",
              "cities": ["Kalasin", "Yang Talat", "Kham Muang", "Sahatsakhan"]
            },
            {
              "name": "Kamphaeng Phet",
              "cities": ["Kamphaeng Phet", "Khlong Lan", "Khanu Woralaksaburi", "Mueang Kaen"]
            },
            {
              "name": "Kanchanaburi",
              "cities": ["Kanchanaburi", "Sai Yok", "Thong Pha Phum", "Bo Phloi"]
            },
            {
              "name": "Khon Kaen",
              "cities": ["Khon Kaen", "Ban Phai", "Chum Phae", "Nam Phong"]
            },
            {
              "name": "Krabi",
              "cities": ["Krabi", "Ao Nang", "Khao Phanom", "Khlong Thom"]
            },
            {
              "name": "Krung Thep Mahanakhon",
              "cities": ["Bangkok", "Bang Na", "Lat Krabang", "Phra Khanong"]
            },
            {
              "name": "Lampang",
              "cities": ["Lampang", "Thoen", "Mae Tha", "Ngao"]
            },
            {
              "name": "Lamphun",
              "cities": ["Lamphun", "Mae Tha", "Ban Thi", "Pa Sang"]
            },
            {
              "name": "Loei",
              "cities": ["Loei", "Chiang Khan", "Dan Sai", "Phu Ruea"]
            },
            {
              "name": "Lop Buri",
              "cities": ["Lop Buri", "Ban Mi", "Chai Badan", "Tha Wung"]
            },
            {
              "name": "Mae Hong Son",
              "cities": ["Mae Hong Son", "Pai", "Khun Yuam", "Mae Sariang"]
            },
            {
              "name": "Maha Sarakham",
              "cities": ["Maha Sarakham", "Kosum Phisai", "Kantharawichai", "Borabue"]
            },
            {
              "name": "Mukdahan",
              "cities": ["Mukdahan", "Dong Luang", "Khamcha-i", "Nikhom Kham Soi"]
            },
            {
              "name": "Nakhon Nayok",
              "cities": ["Nakhon Nayok", "Ban Na", "Pak Phli", "Ongkharak"]
            },
            {
              "name": "Nakhon Pathom",
              "cities": ["Nakhon Pathom", "Kamphaeng Saen", "Nakhon Chai Si", "Don Tum"]
            },
            {
              "name": "Nakhon Phanom",
              "cities": ["Nakhon Phanom", "Tha Uthen", "Renu Nakhon", "Na Kae"]
            },
            {
              "name": "Nakhon Ratchasima",
              "cities": ["Nakhon Ratchasima", "Pak Chong", "Sikhio", "Chok Chai"]
            },
            {
              "name": "Nakhon Sawan",
              "cities": ["Nakhon Sawan", "Phayuha Khiri", "Krok Phra", "Chum Saeng"]
            },
            {
              "name": "Nakhon Si Thammarat",
              "cities": ["Nakhon Si Thammarat", "Thung Song", "Thung Yai", "Chawang"]
            },
            {
              "name": "Nan",
              "cities": ["Nan", "Pua", "Thung Chang", "Wiang Sa"]
            },
            {
              "name": "Narathiwat",
              "cities": ["Narathiwat", "Tak Bai", "Sungai Kolok", "Rueso"]
            },
            {
              "name": "Nong Bua Lamphu",
              "cities": ["Nong Bua Lamphu", "Na Klang", "Non Sang", "Si Bun Rueang"]
            },
            {
              "name": "Nong Khai",
              "cities": ["Nong Khai", "Tha Bo", "Si Chiang Mai", "Sangkhom"]
            },
            {
              "name": "Nonthaburi",
              "cities": ["Nonthaburi", "Pak Kret", "Bang Kruai", "Sai Noi"]
            },
            {
              "name": "Pathum Thani",
              "cities": ["Pathum Thani", "Rangsit", "Thanyaburi", "Lam Luk Ka"]
            },
            {
              "name": "Pattani",
              "cities": ["Pattani", "Yaring", "Nong Chik", "Sai Buri"]
            },
            {
              "name": "Phangnga",
              "cities": ["Phang Nga", "Takua Pa", "Khura Buri", "Thai Mueang"]
            },
            {
              "name": "Phatthalung",
              "cities": ["Phatthalung", "Khao Chaison", "Khuan Khanun", "Pa Phayom"]
            },
            {
              "name": "Phayao",
              "cities": ["Phayao", "Chun", "Dok Kham Tai", "Mae Chai"]
            },
            {
              "name": "Phetchabun",
              "cities": ["Phetchabun", "Lom Sak", "Chon Daen", "Wichian Buri"]
            },
            {
              "name": "Phetchaburi",
              "cities": ["Phetchaburi", "Cha-am", "Tha Yang", "Ban Laem"]
            },
            {
              "name": "Phichit",
              "cities": ["Phichit", "Taphan Hin", "Bang Mun Nak", "Pho Thale"]
            },
            {
              "name": "Phitsanulok",
              "cities": ["Phitsanulok", "Bang Rakam", "Wang Thong", "Nakhon Thai"]
            },
            {
              "name": "Phra Nakhon Si Ayutthaya",
              "cities": ["Ayutthaya", "Bang Pa-in", "Bang Sai", "Uthai"]
            },
            {
              "name": "Phrae",
              "cities": ["Phrae", "Long", "Sung Men", "Den Chai"]
            },
            {
              "name": "Phuket",
              "cities": ["Phuket", "Kathu", "Thalang", "Rassada"]
            },
            {
              "name": "Prachin Buri",
              "cities": ["Prachin Buri", "Kabin Buri", "Si Maha Phot", "Ban Sang"]
            },
            {
              "name": "Prachuap Khiri Khan",
              "cities": ["Prachuap Khiri Khan", "Hua Hin", "Bang Saphan", "Thap Sakae"]
            },
            {
              "name": "Ranong",
              "cities": ["Ranong", "Kra Buri", "La-un", "Kapoe"]
            },
            {
              "name": "Ratchaburi",
              "cities": ["Ratchaburi", "Ban Pong", "Damnoen Saduak", "Photharam"]
            },
            {
              "name": "Rayong",
              "cities": ["Rayong", "Ban Chang", "Klaeng", "Wang Chan"]
            },
            {
              "name": "Roi Et",
              "cities": ["Roi Et", "Kaset Wisai", "Suwannaphum", "Phon Thong"]
            },
            {
              "name": "Sa Kaeo",
              "cities": ["Sa Kaeo", "Aranyaprathet", "Watthana Nakhon", "Khao Chakan"]
            },
            {
              "name": "Sakon Nakhon",
              "cities": ["Sakon Nakhon", "Kusuman", "Phanna Nikhom", "Wanon Niwat"]
            },
            {
              "name": "Samut Prakan",
              "cities": ["Samut Prakan", "Bang Bo", "Bang Phli", "Phra Pradaeng"]
            },
            {
              "name": "Samut Sakhon",
              "cities": ["Samut Sakhon", "Krathum Baen", "Ban Phaeo", "Mueang Mai"]
            },
            {
              "name": "Samut Songkhram",
              "cities": ["Samut Songkhram", "Bang Khonthi", "Amphawa", "Don Tum"]
            },
            {
              "name": "Sara Buri",
              "cities": ["Saraburi", "Kaeng Khoi", "Nong Khae", "Wihan Daeng"]
            },
            {
              "name": "Satun",
              "cities": ["Satun", "Khuan Don", "Thung Wa", "La-ngu"]
            },
            {
              "name": "Sing Buri",
              "cities": ["Sing Buri", "In Buri", "Phrom Buri", "Tha Chang"]
            },
            {
              "name": "Sisaket",
              "cities": ["Sisaket", "Kanthararom", "Uthumphon Phisai", "Khukhan"]
            },
            {
              "name": "Songkhla",
              "cities": ["Songkhla", "Hat Yai", "Sadao", "Chana"]
            },
            {
              "name": "Sukhothai",
              "cities": ["Sukhothai", "Si Satchanalai", "Kong Krailat", "Ban Dan Lan Hoi"]
            },
            {
              "name": "Suphan Buri",
              "cities": ["Suphan Buri", "Doembang Nangbuat", "Song Phi Nong", "Sam Chuk"]
            },
            {
              "name": "Surat Thani",
              "cities": ["Surat Thani", "Kanchanadit", "Don Sak", "Chaiya"]
            },
            {
              "name": "Surin",
              "cities": ["Surin", "Sikhoraphum", "Prasat", "Kap Choeng"]
            },
            {
              "name": "Tak",
              "cities": ["Tak", "Mae Sot", "Umphang", "Ban Tak"]
            },
            {
              "name": "Trang",
              "cities": ["Trang", "Kantang", "Huai Yot", "Palian"]
            },
            {
              "name": "Trat",
              "cities": ["Trat", "Khao Saming", "Laem Ngop", "Bo Rai"]
            },
            {
              "name": "Ubon Ratchathani",
              "cities": ["Ubon Ratchathani", "Warin Chamrap", "Det Udom", "Khemarat"]
            },
            {
              "name": "Udon Thani",
              "cities": ["Udon Thani", "Ban Dung", "Kumphawapi", "Nong Wua So"]
            },
            {
              "name": "Uthai Thani",
              "cities": ["Uthai Thani", "Thap Than", "Sawang Arom", "Ban Rai"]
            },
            {
              "name": "Uttaradit",
              "cities": ["Uttaradit", "Laplae", "Tron", "Phichai"]
            },
            {
              "name": "Yala",
              "cities": ["Yala", "Betong", "Bannang Sata", "Raman"]
            },
            {
              "name": "Yasothon",
              "cities": ["Yasothon", "Kut Chum", "Kham Khuean Kaeo", "Loeng Nok Tha"]
            }
          ]
        },
        {
          "country": "Togo",
          "states": [
            { "name": "Kara", "cities": ["Kara", "Bafilo", "Niamtougou"] },
            { "name": "Plateaux", "cities": ["Atakpamé", "Kpalimé", "Badou"] },
            { "name": "Savanes", "cities": ["Dapaong", "Mango", "Cinkassé"] },
            { "name": "Centrale", "cities": ["Sokodé", "Tchamba", "Sotouboua"] },
            { "name": "Maritime", "cities": ["Lomé", "Tsévié", "Aného"] }
          ]
        },
        {
          "country": "Tonga",
          "states": []
        },
        {
          "country": "Trinidad and Tobago",
          "states": [
            { "name": "Couva", "cities": ["Couva", "Point Lisas", "California"] },
            { "name": "Diego Martin", "cities": ["Diego Martin", "Carenage", "Petit Valley"] },
            { "name": "Mayaro", "cities": ["Mayaro", "Rio Claro", "Guayaguayare"] },
            { "name": "Penal", "cities": ["Penal", "Debe", "Siparia"] },
            { "name": "Princes Town", "cities": ["Princes Town", "Moruga", "Barrackpore"] },
            { "name": "Sangre Grande", "cities": ["Sangre Grande", "Guayamare", "Toco"] },
            { "name": "San Juan", "cities": ["San Juan", "Laventille", "Morvant"] },
            { "name": "Siparia", "cities": ["Siparia", "Fyzabad", "La Brea"] },
            { "name": "Tunapuna", "cities": ["Tunapuna", "Tacarigua", "Arouca"] },
            { "name": "Port-of-Spain", "cities": ["Port of Spain", "St. Clair", "Woodbrook"] },
            { "name": "San Fernando", "cities": ["San Fernando", "Marabella", "Claxton Bay"] },
            { "name": "Arima", "cities": ["Arima", "Arouca", "Malabar"] },
            { "name": "Point Fortin", "cities": ["Point Fortin", "Cap-de-Ville", "Fanny Village"] },
            { "name": "Chaguanas", "cities": ["Chaguanas", "Charlieville", "Felicity"] },
            { "name": "Tobago", "cities": ["Scarborough", "Roxborough", "Charlotteville"] }
          ]
        },
        {
          "country": "Tunisia",
          "states": [
            {
              "name": "Ariana (Aryanah)",
              "cities": ["Ariana", "La Soukra", "Raoued"]
            },
            {
              "name": "Beja (Bajah)",
              "cities": ["Béja", "Nefza", "Testour"]
            },
            {
              "name": "Ben Arous (Bin 'Arus)",
              "cities": ["Ben Arous", "Hammam Lif", "Mornag"]
            },
            {
              "name": "Bizerte (Banzart)",
              "cities": ["Bizerte", "Menzel Bourguiba", "Mateur"]
            },
            {
              "name": "Gabes (Qabis)",
              "cities": ["Gabès", "Métouia", "Ghannouch"]
            },
            {
              "name": "Gafsa (Qafsah)",
              "cities": ["Gafsa", "El Ksar", "Redeyef"]
            },
            {
              "name": "Jendouba (Jundubah)",
              "cities": ["Jendouba", "Tabarka", "Fernana"]
            },
            {
              "name": "Kairouan (Al Qayrawan)",
              "cities": ["Kairouan", "Haffouz", "Chebika"]
            },
            {
              "name": "Kasserine (Al Qasrayn)",
              "cities": ["Kasserine", "Sbeitla", "Fériana"]
            },
            {
              "name": "Kebili (Qibili)",
              "cities": ["Kebili", "Douz", "Souk Lahad"]
            },
            {
              "name": "Kef (Al Kaf)",
              "cities": ["Le Kef", "Nebeur", "Tajerouine"]
            },
            {
              "name": "Mahdia (Al Mahdiyah)",
              "cities": ["Mahdia", "Bou Merdes", "Chebba"]
            },
            {
              "name": "Manouba (Manubah)",
              "cities": ["Manouba", "Douar Hicher", "Mornaguia"]
            },
            {
              "name": "Medenine (Madanin)",
              "cities": ["Medenine", "Ben Gardane", "Zarzis"]
            },
            {
              "name": "Monastir (Al Munastir)",
              "cities": ["Monastir", "Moknine", "Bekalta"]
            },
            {
              "name": "Nabeul (Nabul)",
              "cities": ["Nabeul", "Hammamet", "Kélibia"]
            },
            {
              "name": "Sfax (Safaqis)",
              "cities": ["Sfax", "Sakiet Eddaier", "El Hencha"]
            },
            {
              "name": "Sidi Bou Zid (Sidi Bu Zayd)",
              "cities": ["Sidi Bouzid", "Menzel Bouzaiane", "Regueb"]
            },
            {
              "name": "Siliana (Silyanah)",
              "cities": ["Siliana", "Bou Arada", "Gaâfour"]
            },
            {
              "name": "Sousse (Susah)",
              "cities": ["Sousse", "Msaken", "Akouda"]
            },
            {
              "name": "Tataouine (Tatawin)",
              "cities": ["Tataouine", "Remada", "Ghomrassen"]
            },
            {
              "name": "Tozeur (Tawzar)",
              "cities": ["Tozeur", "Nefta", "Degache"]
            },
            {
              "name": "Tunis",
              "cities": ["Tunis", "Carthage", "La Marsa"]
            },
            {
              "name": "Zaghouan (Zaghwan)",
              "cities": ["Zaghouan", "Bir Mcherga", "Nadhour"]
            }
          ]
        },
        {
          "country": "Turkey",
          "states": [
            { "name": "Adana", "cities": ["Adana", "Ceyhan", "Kozan"] },
            { "name": "Adiyaman", "cities": ["Adıyaman", "Kahta", "Besni"] },
            { "name": "Afyonkarahisar", "cities": ["Afyonkarahisar", "Sandıklı", "Dinar"] },
            { "name": "Agri", "cities": ["Ağrı", "Doğubayazıt", "Patnos"] },
            { "name": "Aksaray", "cities": ["Aksaray", "Eskil", "Ortaköy"] },
            { "name": "Amasya", "cities": ["Amasya", "Merzifon", "Suluova"] },
            { "name": "Ankara", "cities": ["Ankara", "Etimesgut", "Çankaya"] },
            { "name": "Antalya", "cities": ["Antalya", "Alanya", "Manavgat"] },
            { "name": "Ardahan", "cities": ["Ardahan", "Göle", "Hanak"] },
            { "name": "Artvin", "cities": ["Artvin", "Hopa", "Borçka"] },
            { "name": "Aydin", "cities": ["Aydın", "Nazilli", "Söke"] },
            { "name": "Balikesir", "cities": ["Balıkesir", "Bandırma", "Edremit"] },
            { "name": "Bartin", "cities": ["Bartın", "Amasra", "Ulus"] },
            { "name": "Batman", "cities": ["Batman", "Beşiri", "Kozluk"] },
            { "name": "Bayburt", "cities": ["Bayburt", "Demirözü", "Aydıntepe"] },
            { "name": "Bilecik", "cities": ["Bilecik", "Bozüyük", "Osmaneli"] },
            { "name": "Bingol", "cities": ["Bingöl", "Genç", "Solhan"] },
            { "name": "Bitlis", "cities": ["Bitlis", "Tatvan", "Ahlat"] },
            { "name": "Bolu", "cities": ["Bolu", "Gerede", "Mengen"] },
            { "name": "Burdur", "cities": ["Burdur", "Bucak", "Gölhisar"] },
            { "name": "Bursa", "cities": ["Bursa", "İnegöl", "Gemlik"] },
            { "name": "Canakkale", "cities": ["Çanakkale", "Gelibolu", "Biga"] },
            { "name": "Cankiri", "cities": ["Çankırı", "Ilgaz", "Kurşunlu"] },
            { "name": "Corum", "cities": ["Çorum", "Osmancık", "Sungurlu"] },
            { "name": "Denizli", "cities": ["Denizli", "Pamukkale", "Çivril"] },
            { "name": "Diyarbakir", "cities": ["Diyarbakır", "Bismil", "Silvan"] },
            { "name": "Duzce", "cities": ["Düzce", "Akçakoca", "Gölyaka"] },
            { "name": "Edirne", "cities": ["Edirne", "Keşan", "Uzunköprü"] },
            { "name": "Elazig", "cities": ["Elazığ", "Kovancılar", "Maden"] },
            { "name": "Erzincan", "cities": ["Erzincan", "Tercan", "Üzümlü"] },
            { "name": "Erzurum", "cities": ["Erzurum", "Pasinler", "Horasan"] },
            { "name": "Eskisehir", "cities": ["Eskişehir", "Sivrihisar", "Çifteler"] },
            { "name": "Gaziantep", "cities": ["Gaziantep", "Nizip", "İslahiye"] },
            { "name": "Giresun", "cities": ["Giresun", "Bulancak", "Espiye"] },
            { "name": "Gumushane", "cities": ["Gümüşhane", "Kelkit", "Şiran"] },
            { "name": "Hakkari", "cities": ["Hakkâri", "Yüksekova", "Çukurca"] },
            { "name": "Hatay", "cities": ["Antakya", "İskenderun", "Dörtyol"] },
            { "name": "Igdir", "cities": ["Iğdır", "Tuzluca", "Aralık"] },
            { "name": "Isparta", "cities": ["Isparta", "Yalvaç", "Eğirdir"] },
            { "name": "Istanbul", "cities": ["Istanbul", "Kadıköy", "Beşiktaş"] },
            { "name": "Izmir", "cities": ["İzmir", "Çeşme", "Bergama"] },
            { "name": "Kahramanmaras", "cities": ["Kahramanmaraş", "Elbistan", "Afşin"] },
            { "name": "Karabuk", "cities": ["Karabük", "Safranbolu", "Eflani"] },
            { "name": "Karaman", "cities": ["Karaman", "Ermenek", "Ayrancı"] },
            { "name": "Kars", "cities": ["Kars", "Sarıkamış", "Kağızman"] },
            { "name": "Kastamonu", "cities": ["Kastamonu", "Tosya", "İnebolu"] },
            { "name": "Kayseri", "cities": ["Kayseri", "Develi", "Talas"] },
            { "name": "Kilis", "cities": ["Kilis", "Musabeyli", "Elbeyli"] },
            { "name": "Kirikkale", "cities": ["Kırıkkale", "Yahşihan", "Balışeyh"] },
            { "name": "Kirklareli", "cities": ["Kırklareli", "Lüleburgaz", "Babaeski"] },
            { "name": "Kirsehir", "cities": ["Kırşehir", "Kaman", "Mucur"] },
            { "name": "Kocaeli", "cities": ["İzmit", "Gebze", "Darıca"] },
            { "name": "Konya", "cities": ["Konya", "Ereğli", "Akşehir"] },
            { "name": "Kutahya", "cities": ["Kütahya", "Tavşanlı", "Simav"] },
            { "name": "Malatya", "cities": ["Malatya", "Battalgazi", "Doğanşehir"] },
            { "name": "Manisa", "cities": ["Manisa", "Salihli", "Akhisar"] },
            { "name": "Mardin", "cities": ["Mardin", "Kızıltepe", "Nusaybin"] },
            { "name": "Mersin", "cities": ["Mersin", "Tarsus", "Erdemli"] },
            { "name": "Mugla", "cities": ["Muğla", "Bodrum", "Fethiye"] },
            { "name": "Mus", "cities": ["Muş", "Bulanık", "Malazgirt"] },
            { "name": "Nevsehir", "cities": ["Nevşehir", "Ürgüp", "Avanos"] },
            { "name": "Nigde", "cities": ["Niğde", "Bor", "Ulukışla"] },
            { "name": "Ordu", "cities": ["Ordu", "Ünye", "Fatsa"] },
            { "name": "Osmaniye", "cities": ["Osmaniye", "Kadirli", "Düziçi"] },
            { "name": "Rize", "cities": ["Rize", "Çayeli", "Pazar"] },
            { "name": "Sakarya", "cities": ["Sakarya", "Adapazarı", "Akyazı"] },
            { "name": "Samsun", "cities": ["Samsun", "Bafra", "Çarşamba"] },
            { "name": "Sanliurfa", "cities": ["Şanlıurfa", "Viranşehir", "Siverek"] },
            { "name": "Siirt", "cities": ["Siirt", "Kurtalan", "Pervari"] },
            { "name": "Sinop", "cities": ["Sinop", "Boyabat", "Ayancık"] },
            { "name": "Sirnak", "cities": ["Şırnak", "Cizre", "Silopi"] },
            { "name": "Sivas", "cities": ["Sivas", "Şarkışla", "Gemerek"] },
            { "name": "Tekirdag", "cities": ["Tekirdağ", "Çorlu", "Malkara"] },
            { "name": "Tokat", "cities": ["Tokat", "Turhal", "Zile"] },
            { "name": "Trabzon", "cities": ["Trabzon", "Akçaabat", "Maçka"] },
            { "name": "Tunceli", "cities": ["Tunceli", "Pertek", "Çemişgezek"] },
            { "name": "Usak", "cities": ["Uşak", "Banaz", "Eşme"] },
            { "name": "Van", "cities": ["Van", "Erciş", "Başkale"] },
            { "name": "Yalova", "cities": ["Yalova", "Çınarcık", "Termal"] },
            { "name": "Yozgat", "cities": ["Yozgat", "Sorgun", "Akdağmadeni"] },
            { "name": "Zonguldak", "cities": ["Zonguldak", "Ereğli", "Çaycuma"] }
          ]
        },
          {
            "country": "Turkmenistan",
            "states": [
              { "name": "Ahal Welayaty (Ashgabat)", "cities": ["Ashgabat", "Anau", "Baharly"] },
              { "name": "Balkan Welayaty (Balkanabat)", "cities": ["Balkanabat", "Turkmenbashi", "Gumdag"] },
              { "name": "Dashoguz Welayaty", "cities": ["Dashoguz", "Koneurgench", "Boldumsaz"] },
              { "name": "Lebap Welayaty (Turkmenabat)", "cities": ["Turkmenabat", "Atamyrat", "Farap"] },
              { "name": "Mary Welayaty", "cities": ["Mary", "Bayramaly", "Yoloten"] }
            ]
          },
          {
            "country": "Uganda",
            "states": [
              { "name": "Adjumani", "cities": ["Adjumani", "Dzaipi", "Pakele"] },
              { "name": "Apac", "cities": ["Apac", "Akokoro", "Chegere"] },
              { "name": "Arua", "cities": ["Arua", "Koboko", "Yumbe"] },
              { "name": "Bugiri", "cities": ["Bugiri", "Busia", "Buwunga"] },
              { "name": "Bundibugyo", "cities": ["Bundibugyo", "Ntoroko", "Busaru"] },
              { "name": "Bushenyi", "cities": ["Bushenyi", "Kakanju", "Nyakabirizi"] },
              { "name": "Busia", "cities": ["Busia", "Masafu", "Lumino"] },
              { "name": "Gulu", "cities": ["Gulu", "Awach", "Bobi"] },
              { "name": "Hoima", "cities": ["Hoima", "Kigorobya", "Buseruka"] },
              { "name": "Iganga", "cities": ["Iganga", "Namutumba", "Kigulu"] },
              { "name": "Jinja", "cities": ["Jinja", "Buwenge", "Kakira"] },
              { "name": "Kabale", "cities": ["Kabale", "Rukungiri", "Muko"] },
              { "name": "Kabarole", "cities": ["Fort Portal", "Kabarole", "Kijura"] },
              { "name": "Kaberamaido", "cities": ["Kaberamaido", "Kaberamaido Town", "Kalaki"] },
              { "name": "Kalangala", "cities": ["Kalangala", "Lutoboka", "Buggala"] },
              { "name": "Kampala", "cities": ["Kampala", "Makindye", "Kawempe"] },
              { "name": "Kamuli", "cities": ["Kamuli", "Namasagali", "Balawoli"] },
              { "name": "Kamwenge", "cities": ["Kamwenge", "Bigodi", "Kyenjojo"] },
              { "name": "Kanungu", "cities": ["Kanungu", "Kihihi", "Kambuga"] },
              { "name": "Kapchorwa", "cities": ["Kapchorwa", "Sipi", "Bukwa"] },
              { "name": "Kasese", "cities": ["Kasese", "Hima", "Kilembe"] },
              { "name": "Katakwi", "cities": ["Katakwi", "Ngariam", "Toroma"] },
              { "name": "Kayunga", "cities": ["Kayunga", "Nazigo", "Bbaale"] },
              { "name": "Kibale", "cities": ["Kibale", "Kibale Town", "Bwikara"] },
              { "name": "Kiboga", "cities": ["Kiboga", "Muwanga", "Dwaniro"] },
              { "name": "Kisoro", "cities": ["Kisoro", "Nkuringo", "Bunagana"] },
              { "name": "Kitgum", "cities": ["Kitgum", "Pader", "Agago"] },
              { "name": "Kotido", "cities": ["Kotido", "Kaabong", "Karenga"] },
              { "name": "Kumi", "cities": ["Kumi", "Ngora", "Ongino"] },
              { "name": "Kyenjojo", "cities": ["Kyenjojo", "Mpara", "Rwimi"] },
              { "name": "Lira", "cities": ["Lira", "Alebtong", "Amach"] },
              { "name": "Luwero", "cities": ["Luwero", "Wobulenzi", "Katikamu"] },
              { "name": "Masaka", "cities": ["Masaka", "Bukakata", "Kyotera"] },
              { "name": "Masindi", "cities": ["Masindi", "Kigumba", "Bwijanga"] },
              { "name": "Mayuge", "cities": ["Mayuge", "Buwanga", "Kityerera"] },
              { "name": "Mbale", "cities": ["Mbale", "Bungokho", "Nkoma"] },
              { "name": "Mbarara", "cities": ["Mbarara", "Rwampara", "Kashari"] },
              { "name": "Moroto", "cities": ["Moroto", "Nakapiripirit", "Lokopo"] },
              { "name": "Moyo", "cities": ["Moyo", "Obongi", "Palorinya"] },
              { "name": "Mpigi", "cities": ["Mpigi", "Kammengo", "Muduma"] },
              { "name": "Mubende", "cities": ["Mubende", "Kasambya", "Kiganda"] },
              { "name": "Mukono", "cities": ["Mukono", "Njeru", "Seeta"] },
              { "name": "Nakapiripirit", "cities": ["Nakapiripirit", "Lorengedwat", "Namalu"] },
              { "name": "Nakasongola", "cities": ["Nakasongola", "Kakooge", "Wabinyonyi"] },
              { "name": "Nebbi", "cities": ["Nebbi", "Paidha", "Zombo"] },
              { "name": "Ntungamo", "cities": ["Ntungamo", "Rwashamaire", "Rubaare"] },
              { "name": "Pader", "cities": ["Pader", "Acholibur", "Lapul"] },
              { "name": "Pallisa", "cities": ["Pallisa", "Kibuku", "Butebo"] },
              { "name": "Rakai", "cities": ["Rakai", "Kalisizo", "Kacheera"] },
              { "name": "Rukungiri", "cities": ["Rukungiri", "Buyanja", "Nyakagyeme"] },
              { "name": "Sembabule", "cities": ["Sembabule", "Lwemiyaga", "Mateete"] },
              { "name": "Sironko", "cities": ["Sironko", "Budadiri", "Bumasifwa"] },
              { "name": "Soroti", "cities": ["Soroti", "Dokolo", "Amuria"] },
              { "name": "Tororo", "cities": ["Tororo", "Malaba", "Nagongera"] },
              { "name": "Wakiso", "cities": ["Wakiso", "Entebbe", "Kira"] },
              { "name": "Yumbe", "cities": ["Yumbe", "Kululu", "Odravu"] }
            ]
          }
        ,
        {
          "country": "Ukraine",
          "states": [
            { "name": "Cherkasy", "cities": ["Cherkasy", "Smila", "Uman"] },
            { "name": "Chernihiv", "cities": ["Chernihiv", "Nizhyn", "Pryluky"] },
            { "name": "Chernivtsi", "cities": ["Chernivtsi", "Novodnistrovsk", "Storozhynets"] },
            { "name": "Crimea", "cities": ["Simferopol", "Sevastopol", "Yalta"] },
            { "name": "Dnipropetrovs'k", "cities": ["Dnipro", "Kryvyi Rih", "Kamianske"] },
            { "name": "Donets'k", "cities": ["Donetsk", "Mariupol", "Makiivka"] },
            { "name": "Ivano-Frankivs'k", "cities": ["Ivano-Frankivsk", "Kalush", "Kolomyia"] },
            { "name": "Kharkiv", "cities": ["Kharkiv", "Lozova", "Izyum"] },
            { "name": "Kherson", "cities": ["Kherson", "Nova Kakhovka", "Kakhovka"] },
            { "name": "Khmel'nyts'kyy", "cities": ["Khmelnytskyi", "Kamianets-Podilskyi", "Shepetivka"] },
            { "name": "Kirovohrad", "cities": ["Kropyvnytskyi", "Oleksandriia", "Svitlovodsk"] },
            { "name": "Kiev", "cities": ["Kyiv", "Brovary", "Bila Tserkva"] },
            { "name": "Kyyiv", "cities": ["Kyiv", "Irpin", "Vyshhorod"] },
            { "name": "Luhans'k", "cities": ["Luhansk", "Sievierodonetsk", "Alchevsk"] },
            { "name": "L'viv", "cities": ["Lviv", "Drohobych", "Stryi"] },
            { "name": "Mykolayiv", "cities": ["Mykolaiv", "Pervomaisk", "Yuzhnoukrainsk"] },
            { "name": "Odesa", "cities": ["Odesa", "Izmail", "Chornomorsk"] },
            { "name": "Poltava", "cities": ["Poltava", "Kremenchuk", "Lubny"] },
            { "name": "Rivne", "cities": ["Rivne", "Dubno", "Kostopil"] },
            { "name": "Sevastopol'", "cities": ["Sevastopol", "Balaklava", "Inkerman"] },
            { "name": "Sumy", "cities": ["Sumy", "Konotop", "Shostka"] },
            { "name": "Ternopil'", "cities": ["Ternopil", "Kremenets", "Chortkiv"] },
            { "name": "Vinnytsya", "cities": ["Vinnytsia", "Zhmerynka", "Haisyn"] },
            { "name": "Volyn'", "cities": ["Lutsk", "Kovel", "Novovolynsk"] },
            { "name": "Zakarpattya", "cities": ["Uzhhorod", "Mukachevo", "Khust"] },
            { "name": "Zaporizhzhya", "cities": ["Zaporizhzhia", "Melitopol", "Berdiansk"] },
            { "name": "Zhytomyr", "cities": ["Zhytomyr", "Berdychiv", "Korosten"] }
          ]
        },
        {
          "country": "United Arab Emirates",
          "states": [
            { "name": "Abu Dhabi", "cities": ["Abu Dhabi", "Al Ain", "Liwa Oasis"] },
            { "name": "'Ajman", "cities": ["Ajman", "Masfout", "Al Manama"] },
            { "name": "Al Fujayrah", "cities": ["Fujairah", "Dibba Al-Fujairah", "Khor Fakkan"] },
            { "name": "Sharjah", "cities": ["Sharjah", "Khor Fakkan", "Dhaid"] },
            { "name": "Dubai", "cities": ["Dubai", "Jebel Ali", "Hatta"] },
            { "name": "Ra's al Khaymah", "cities": ["Ras Al Khaimah", "Al Jazirah Al Hamra", "Digdaga"] },
            { "name": "Umm al Qaywayn", "cities": ["Umm Al Quwain", "Al Sinniyah", "Falaj Al Mualla"] }
          ]
        },
        {
          "country": "United Kingdom",
          "states": []
        },
        {
          "country": "United States",
          "code": "us",
          "states": [
            {
              "name": "Alabama",
              "cities": ["Abbeville","Andalusia","Anniston","Ashland","Ashville","Athens","Bay Minette","Birmingham","Brewton","Butler","Camden","Carrollton","Centre","Centreville","Chatom","Clanton","Clayton","Columbiana","Cullman","Dadeville","Decatur","Dothan","Double Springs","Elba","Eutaw","Evergreen", "Fayette","Florence","Fort Payne","Gadsden","Geneva","Greensboro", "Greenville","Grove Hill" , "Guntersville","Hamilton","Hayneville", "Heflin","Huntsville","Jasper","LaFayette","Linden","Livingston","Luverne","Marion", "Mobile", "Monroeville","Montgomery","Moulton","Huntsville", "Oneonta", "Opelika","Ozark","Pell City","Phenix City","Prattville","Rockford","Russellville","Scottsboro","Selma","Talladega","Troy","Tuscaloosa", "Tuscumbia", "Tuskegee", "Union Springs", "Vernon", "Wedowee","Wetumpka"]
            },
            {
              "name": "Alaska",
              "cities": [
                "Anchorage",
                "Fairbanks",
                "Juneau",
                "Sitka",
                "Ketchikan",
                "Wasilla",
                "Kenai",
                "Kodiak",
                "Bethel",
                "Palmer",
                "Homer",
                "Barrow (Utqiaġvik)",
                "Soldotna",
                "Valdez",
                "Nome",
                "Petersburg",
                "Seward",
                "Cordova",
                "Unalaska",
                "Wrangell",
                "Dillingham",
                "Haines",
                "Craig",
                "Hooper Bay",
                "Kotzebue",
                "Skagway",
                "North Pole",
                "Tok",
                "Delta Junction",
                "Glennallen",
                "King Salmon",
                "Sand Point",
                "Emmonak",
                "Galena",
                "Klawock",
                "Selawik",
                "Chevak",
                "Quinhagak",
                "Nenana",
                "Fort Yukon",
                "St. Mary's",
                "Akutan",
                "Eagle River",
                "Girdwood",
                "Healy",
                "Kodiak Station",
                "Nikiski",
                "Sterling",
                "Willow",
                "Big Lake",
                "Houston",
                "Sutton-Alpine",
                "Talkeetna",
                "Cantwell",
                "Copper Center",
                "Glacier View",
                "Hope",
                "Moose Pass",
                "Ninilchik",
                "Seldovia",
                "Tyonek",
                "Whittier",
                "Adak",
                "Atka",
                "Brevig Mission",
                "Chefornak",
                "Chignik",
                "Clarks Point",
                "Coffman Cove",
                "Deering",
                "Eek",
                "False Pass",
                "Gambell",
                "Goodnews Bay",
                "Grayling",
                "Holy Cross",
                "Kaktovik",
                "Kiana",
                "Kipnuk",
                "Kivalina",
                "Kongiganak",
                "Kotlik",
                "Kwethluk",
                "Larsen Bay",
                "Manokotak",
                "Marshall",
                "McGrath",
                "Mekoryuk",
                "Mountain Village",
                "Napakiak",
                "Napaskiak",
                "Nelson Lagoon",
                "New Stuyahok",
                "Nightmute",
                "Noorvik",
                "Nuiqsut",
                "Nulato",
                "Nunam Iqua",
                "Nunapitchuk",
                "Old Harbor",
                "Ouzinkie",
                "Point Hope",
                "Point Lay",
                "Port Lions",
                "Russian Mission",
                "Savoonga",
                "Scammon Bay",
                "Shaktoolik",
                "Shishmaref",
                "Stebbins",
                "Teller",
                "Togiak",
                "Tuluksak",
                "Tuntutuliak",
                "Tununak",
                "Unalakleet",
                "Wainwright",
                "Wales",
                "White Mountain",
                "Yakutat"
              ]
            },
            {
              "name": "Arizona",
              "cities": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"]
            },
            {
              "name": "Arkansas",
              "cities": ["Little Rock", "Fayetteville", "Fort Smith", "Springdale", "Jonesboro"]
            },
            {
              "name": "California",
              "cities": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Sacramento"]
            },
            {
              "name": "Colorado",
              "cities": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"]
            },
            {
              "name": "Connecticut",
              "cities": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury"]
            },
            {
              "name": "Delaware",
              "cities": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"]
            },
            {
              "name": "District of Columbia",
              "cities": ["Washington, D.C."]
            },
            {
              "name": "Florida",
              "cities": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"]
            },
            {
              "name": "Georgia",
              "cities": ["Atlanta", "Savannah", "Augusta", "Columbus", "Athens"]
            },
            {
              "name": "Hawaii",
              "cities": ["Honolulu", "Hilo", "Kailua", "Kaneohe", "Waipahu"]
            },
            {
              "name": "Idaho",
              "cities": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"]
            },
            {
              "name": "Illinois",
              "cities": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville"]
            },
            {
              "name": "Indiana",
              "cities": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"]
            },
            {
              "name": "Iowa",
              "cities": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"]
            },
            {
              "name": "Kansas",
              "cities": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe"]
            },
            {
              "name": "Kentucky",
              "cities": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"]
            },
            {
              "name": "Louisiana",
              "cities": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"]
            },
            {
              "name": "Maine",
              "cities": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"]
            },
            {
              "name": "Maryland",
              "cities": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie"]
            },
            {
              "name": "Massachusetts",
              "cities": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"]
            },
            {
              "name": "Michigan",
              "cities": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"]
            },
            {
              "name": "Minnesota",
              "cities": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington"]
            },
            {
              "name": "Mississippi",
              "cities": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"]
            },
            {
              "name": "Missouri",
              "cities": ["Kansas City", "Saint Louis", "Springfield", "Independence", "Columbia"]
            },
            {
              "name": "Montana",
              "cities": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"]
            },
            {
              "name": "Nebraska",
              "cities": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"]
            },
            {
              "name": "Nevada",
              "cities": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"]
            },
            {
              "name": "New Hampshire",
              "cities": ["Manchester", "Nashua", "Concord", "Dover", "Rochester"]
            },
            {
              "name": "New Jersey",
              "cities": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison"]
            },
            {
              "name": "New Mexico",
              "cities": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"]
            },
            {
              "name": "New York",
              "cities": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"]
            },
            {
              "name": "North Carolina",
              "cities": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"]
            },
            {
              "name": "North Dakota",
              "cities": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"]
            },
            {
              "name": "Ohio",
              "cities": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"]
            },
            {
              "name": "Oklahoma",
              "cities": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"]
            },
            {
              "name": "Oregon",
              "cities": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"]
            },
            {
              "name": "Pennsylvania",
              "cities": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"]
            },
            {
              "name": "Rhode Island",
              "cities": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"]
            },
            {
              "name": "South Carolina",
              "cities": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill"]
            },
            {
              "name": "South Dakota",
              "cities": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"]
            },
            {
              "name": "Tennessee",
              "cities": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"]
            },
            {
              "name": "Texas",
              "cities": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"]
            },
            {
              "name": "Utah",
              "cities": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"]
            },
            {
              "name": "Vermont",
              "cities": ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier"]
            },
            {
              "name": "Virginia",
              "cities": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington"]
            },
            {
              "name": "Washington",
              "cities": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"]
            },
            {
              "name": "West Virginia",
              "cities": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"]
            },
            {
              "name": "Wisconsin",
              "cities": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"]
            },
            {
              "name": "Wyoming",
              "cities": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"]
            }
          ]
        },
        {
          "country": "Uruguay",
          "states": [
            {
              "name": "Artigas",
              "cities": ["Artigas", "Bella Unión", "Tomás Gomensoro"]
            },
            {
              "name": "Canelones",
              "cities": ["Canelones", "Ciudad de la Costa", "Las Piedras", "Pando", "Santa Lucía"]
            },
            {
              "name": "Cerro Largo",
              "cities": ["Melo", "Río Branco", "Fraile Muerto"]
            },
            {
              "name": "Colonia",
              "cities": ["Colonia del Sacramento", "Carmelo", "Nueva Helvecia", "Juan Lacaze"]
            },
            {
              "name": "Durazno",
              "cities": ["Durazno", "Sarandí del Yí", "Villa del Carmen"]
            },
            {
              "name": "Flores",
              "cities": ["Trinidad", "Ismael Cortinas", "Andresito"]
            },
            {
              "name": "Florida",
              "cities": ["Florida", "Sarandí Grande", "Casupá"]
            },
            {
              "name": "Lavalleja",
              "cities": ["Minas", "José Pedro Varela", "Solís de Mataojo"]
            },
            {
              "name": "Maldonado",
              "cities": ["Maldonado", "Punta del Este", "San Carlos", "Piriápolis"]
            },
            {
              "name": "Montevideo",
              "cities": ["Montevideo", "Ciudad Vieja", "Pocitos", "Carrasco"]
            },
            {
              "name": "Paysandú",
              "cities": ["Paysandú", "Guichón", "Quebracho"]
            },
            {
              "name": "Río Negro",
              "cities": ["Fray Bentos", "Young", "Nuevo Berlín"]
            },
            {
              "name": "Rivera",
              "cities": ["Rivera", "Tranqueras", "Vichadero"]
            },
            {
              "name": "Rocha",
              "cities": ["Rocha", "Chuy", "La Paloma", "Castillos"]
            },
            {
              "name": "Salto",
              "cities": ["Salto", "Daymán", "Constitución"]
            },
            {
              "name": "San José",
              "cities": ["San José de Mayo", "Ciudad del Plata", "Libertad"]
            },
            {
              "name": "Soriano",
              "cities": ["Mercedes", "Dolores", "Cardona"]
            },
            {
              "name": "Tacuarembó",
              "cities": ["Tacuarembó", "Paso de los Toros", "San Gregorio de Polanco"]
            },
            {
              "name": "Treinta y Tres",
              "cities": ["Treinta y Tres", "Santa Clara de Olimar", "Vergara"]
            }
          ]
        },
        {
          "country": "Uzbekistan",
          "states": [
            {
              "name": "Andijon Viloyati",
              "cities": ["Andijan", "Asaka", "Shahrikhon"]
            },
            {
              "name": "Buxoro Viloyati",
              "cities": ["Bukhara", "Kogon", "Galaosiyo"]
            },
            {
              "name": "Farg'ona Viloyati",
              "cities": ["Fergana", "Margilan", "Kokand"]
            },
            {
              "name": "Jizzax Viloyati",
              "cities": ["Jizzakh", "Gagarin", "Dustlik"]
            },
            {
              "name": "Namangan Viloyati",
              "cities": ["Namangan", "Chust", "Kosonsoy"]
            },
            {
              "name": "Navoiy Viloyati",
              "cities": ["Navoiy", "Zarafshan", "Uchkuduk"]
            },
            {
              "name": "Qashqadaryo Viloyati",
              "cities": ["Qarshi", "Shahrisabz", "Kitab"]
            },
            {
              "name": "Qaraqalpog'iston Respublikasi",
              "cities": ["Nukus", "Khujayli", "Beruniy"]
            },
            {
              "name": "Samarqand Viloyati",
              "cities": ["Samarkand", "Kattakurgan", "Urgut"]
            },
            {
              "name": "Sirdaryo Viloyati",
              "cities": ["Guliston", "Shirin", "Yangiyer"]
            },
            {
              "name": "Surxondaryo Viloyati",
              "cities": ["Termez", "Denov", "Shargun"]
            },
            {
              "name": "Toshkent Shahri",
              "cities": ["Tashkent", "Yunusabad", "Mirzo Ulugbek"]
            },
            {
              "name": "Toshkent Viloyati",
              "cities": ["Nurafshon", "Angren", "Chirchiq"]
            },
            {
              "name": "Xorazm Viloyati",
              "cities": ["Urgench", "Khiva", "Gurlan"]
            }
          ]
        },
        {
          "country": "Vanuatu",
          "states": [
            {
              "name": "Malampa",
              "cities": ["Lakatoro", "Norsup", "Uripiv"]
            },
            {
              "name": "Penama",
              "cities": ["Saratamata", "Longana", "Port Olry"]
            },
            {
              "name": "Sanma",
              "cities": ["Luganville", "Port Olry", "Turtle Bay"]
            },
            {
              "name": "Shefa",
              "cities": ["Port Vila", "Efate", "Erakor"]
            },
            {
              "name": "Tafea",
              "cities": ["Isangel", "Lenakel", "White Sands"]
            },
            {
              "name": "Torba",
              "cities": ["Sola", "Vanua Lava", "Mota Lava"]
            }
          ]
        },
        {
          "country": "Venezuela",
          "states": [
            {
              "name": "Amazonas",
              "cities": ["Puerto Ayacucho", "Maroa", "San Carlos de Río Negro"]
            },
            {
              "name": "Anzoategui",
              "cities": ["Barcelona", "Puerto La Cruz", "El Tigre", "Anaco"]
            },
            {
              "name": "Apure",
              "cities": ["San Fernando de Apure", "Guasdualito", "Elorza"]
            },
            {
              "name": "Aragua",
              "cities": ["Maracay", "Turmero", "La Victoria", "El Limón"]
            },
            {
              "name": "Barinas",
              "cities": ["Barinas", "Socopó", "Santa Bárbara"]
            },
            {
              "name": "Bolivar",
              "cities": ["Ciudad Bolívar", "Ciudad Guayana", "Upata", "El Callao"]
            },
            {
              "name": "Carabobo",
              "cities": ["Valencia", "Puerto Cabello", "Guacara", "Los Guayos"]
            },
            {
              "name": "Cojedes",
              "cities": ["San Carlos", "Tinaquillo", "El Baúl"]
            },
            {
              "name": "Delta Amacuro",
              "cities": ["Tucupita", "Pedernales", "Curiapo"]
            },
            {
              "name": "Dependencias Federales",
              "cities": ["Los Roques", "La Tortuga", "Isla Margarita"]
            },
            {
              "name": "Distrito Federal",
              "cities": ["Caracas", "Petare", "Baruta", "El Hatillo"]
            },
            {
              "name": "Falcon",
              "cities": ["Coro", "Punto Fijo", "La Vela de Coro", "Pueblo Nuevo"]
            },
            {
              "name": "Guarico",
              "cities": ["San Juan de los Morros", "Calabozo", "Valle de la Pascua"]
            },
            {
              "name": "Lara",
              "cities": ["Barquisimeto", "Carora", "Quíbor", "El Tocuyo"]
            },
            {
              "name": "Merida",
              "cities": ["Mérida", "El Vigía", "Tovar", "Ejido"]
            },
            {
              "name": "Miranda",
              "cities": ["Los Teques", "Petare", "Guarenas", "Guatire"]
            },
            {
              "name": "Monagas",
              "cities": ["Maturín", "Punta de Mata", "Caripito", "Temblador"]
            },
            {
              "name": "Nueva Esparta",
              "cities": ["La Asunción", "Porlamar", "Juan Griego", "Pampatar"]
            },
            {
              "name": "Portuguesa",
              "cities": ["Guanare", "Acarigua", "Araure", "Villa Bruzual"]
            },
            {
              "name": "Sucre",
              "cities": ["Cumaná", "Carúpano", "Güiria", "Araya"]
            },
            {
              "name": "Tachira",
              "cities": ["San Cristóbal", "Táriba", "Rubio", "La Fría"]
            },
            {
              "name": "Trujillo",
              "cities": ["Trujillo", "Valera", "Boconó", "La Quebrada"]
            },
            {
              "name": "Vargas",
              "cities": ["La Guaira", "Catia La Mar", "Maiquetía", "Caraballeda"]
            },
            {
              "name": "Yaracuy",
              "cities": ["San Felipe", "Yaritagua", "Chivacoa", "Nirgua"]
            },
            {
              "name": "Zulia",
              "cities": ["Maracaibo", "Cabimas", "Ciudad Ojeda", "Santa Bárbara del Zulia"]
            }
          ]
        },
        {
          "country": "Vietnam",
          "states": [
            {
              "name": "An Giang",
              "cities": ["Long Xuyên", "Châu Đốc", "Tân Châu", "An Phú"]
            },
            {
              "name": "Bac Giang",
              "cities": ["Bắc Giang", "Việt Yên", "Lục Ngạn", "Yên Dũng"]
            },
            {
              "name": "Bac Kan",
              "cities": ["Bắc Kạn", "Chợ Mới", "Na Rì", "Ba Bể"]
            },
            {
              "name": "Bac Lieu",
              "cities": ["Bạc Liêu", "Giá Rai", "Hồng Dân", "Phước Long"]
            },
            {
              "name": "Bac Ninh",
              "cities": ["Bắc Ninh", "Từ Sơn", "Tiên Du", "Quế Võ"]
            },
            {
              "name": "Ba Ria-Vung Tau",
              "cities": ["Vũng Tàu", "Bà Rịa", "Phú Mỹ", "Châu Đức"]
            },
            {
              "name": "Ben Tre",
              "cities": ["Bến Tre", "Châu Thành", "Mỏ Cày", "Giồng Trôm"]
            },
            {
              "name": "Binh Dinh",
              "cities": ["Quy Nhơn", "An Nhơn", "Hoài Nhơn", "Phù Cát"]
            },
            {
              "name": "Binh Duong",
              "cities": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát"]
            },
            {
              "name": "Binh Phuoc",
              "cities": ["Đồng Xoài", "Bình Long", "Phước Long", "Lộc Ninh"]
            },
            {
              "name": "Binh Thuan",
              "cities": ["Phan Thiết", "La Gi", "Tuy Phong", "Hàm Thuận Nam"]
            },
            {
              "name": "Ca Mau",
              "cities": ["Cà Mau", "Đầm Dơi", "Cái Nước", "Thới Bình"]
            },
            {
              "name": "Cao Bang",
              "cities": ["Cao Bằng", "Bảo Lạc", "Hạ Lang", "Trùng Khánh"]
            },
            {
              "name": "Dac Lak",
              "cities": ["Buôn Ma Thuột", "Buôn Hồ", "Ea Kar", "Krông Pắk"]
            },
            {
              "name": "Dac Nong",
              "cities": ["Gia Nghĩa", "Đắk Mil", "Đắk Song", "Cư Jút"]
            },
            {
              "name": "Dien Bien",
              "cities": ["Điện Biên Phủ", "Mường Lay", "Tuần Giáo", "Mường Chà"]
            },
            {
              "name": "Dong Nai",
              "cities": ["Biên Hòa", "Long Khánh", "Nhơn Trạch", "Trảng Bom"]
            },
            {
              "name": "Dong Thap",
              "cities": ["Cao Lãnh", "Sa Đéc", "Hồng Ngự", "Tam Nông"]
            },
            {
              "name": "Gia Lai",
              "cities": ["Pleiku", "An Khê", "Ayun Pa", "Chư Păh"]
            },
            {
              "name": "Ha Giang",
              "cities": ["Hà Giang", "Đồng Văn", "Mèo Vạc", "Quản Bạ"]
            },
            {
              "name": "Hai Duong",
              "cities": ["Hải Dương", "Chí Linh", "Kinh Môn", "Nam Sách"]
            },
            {
              "name": "Ha Nam",
              "cities": ["Phủ Lý", "Duy Tiên", "Kim Bảng", "Lý Nhân"]
            },
            {
              "name": "Ha Tay",
              "cities": ["Hà Đông", "Sơn Tây", "Phú Xuyên", "Thạch Thất"]
            },
            {
              "name": "Ha Tinh",
              "cities": ["Hà Tĩnh", "Hồng Lĩnh", "Kỳ Anh", "Cẩm Xuyên"]
            },
            {
              "name": "Hau Giang",
              "cities": ["Vị Thanh", "Ngã Bảy", "Châu Thành", "Long Mỹ"]
            },
            {
              "name": "Hoa Binh",
              "cities": ["Hòa Bình", "Mai Châu", "Lương Sơn", "Kỳ Sơn"]
            },
            {
              "name": "Hung Yen",
              "cities": ["Hưng Yên", "Mỹ Hào", "Ân Thi", "Khoái Châu"]
            },
            {
              "name": "Khanh Hoa",
              "cities": ["Nha Trang", "Cam Ranh", "Ninh Hòa", "Diên Khánh"]
            },
            {
              "name": "Kien Giang",
              "cities": ["Rạch Giá", "Hà Tiên", "Phú Quốc", "Kiên Lương"]
            },
            {
              "name": "Kon Tum",
              "cities": ["Kon Tum", "Đắk Glei", "Ngọc Hồi", "Sa Thầy"]
            },
            {
              "name": "Lai Chau",
              "cities": ["Lai Châu", "Phong Thổ", "Sìn Hồ", "Tam Đường"]
            },
            {
              "name": "Lam Dong",
              "cities": ["Đà Lạt", "Bảo Lộc", "Đức Trọng", "Lâm Hà"]
            },
            {
              "name": "Lang Son",
              "cities": ["Lạng Sơn", "Cao Lộc", "Đình Lập", "Tràng Định"]
            },
            {
              "name": "Lao Cai",
              "cities": ["Lào Cai", "Sa Pa", "Bảo Thắng", "Bát Xát"]
            },
            {
              "name": "Long An",
              "cities": ["Tân An", "Bến Lức", "Cần Giuộc", "Đức Hòa"]
            },
            {
              "name": "Nam Dinh",
              "cities": ["Nam Định", "Mỹ Lộc", "Ý Yên", "Vụ Bản"]
            },
            {
              "name": "Nghe An",
              "cities": ["Vinh", "Cửa Lò", "Thái Hòa", "Quỳnh Lưu"]
            },
            {
              "name": "Ninh Binh",
              "cities": ["Ninh Bình", "Tam Điệp", "Hoa Lư", "Gia Viễn"]
            },
            {
              "name": "Ninh Thuan",
              "cities": ["Phan Rang-Tháp Chàm", "Ninh Hải", "Ninh Sơn", "Thuận Nam"]
            },
            {
              "name": "Phu Tho",
              "cities": ["Việt Trì", "Phú Thọ", "Lâm Thao", "Thanh Ba"]
            },
            {
              "name": "Phu Yen",
              "cities": ["Tuy Hòa", "Sông Cầu", "Đồng Xuân", "Sơn Hòa"]
            },
            {
              "name": "Quang Binh",
              "cities": ["Đồng Hới", "Ba Đồn", "Quảng Trạch", "Lệ Thủy"]
            },
            {
              "name": "Quang Nam",
              "cities": ["Tam Kỳ", "Hội An", "Điện Bàn", "Duy Xuyên"]
            },
            {
              "name": "Quang Ngai",
              "cities": ["Quảng Ngãi", "Bình Sơn", "Sơn Tịnh", "Mộ Đức"]
            },
            {
              "name": "Quang Ninh",
              "cities": ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái"]
            },
            {
              "name": "Quang Tri",
              "cities": ["Đông Hà", "Quảng Trị", "Vĩnh Linh", "Gio Linh"]
            },
            {
              "name": "Soc Trang",
              "cities": ["Sóc Trăng", "Vĩnh Châu", "Ngã Năm", "Mỹ Xuyên"]
            },
            {
              "name": "Son La",
              "cities": ["Sơn La", "Mai Sơn", "Mộc Châu", "Yên Châu"]
            },
            {
              "name": "Tay Ninh",
              "cities": ["Tây Ninh", "Trảng Bàng", "Gò Dầu", "Bến Cầu"]
            },
            {
              "name": "Thai Binh",
              "cities": ["Thái Bình", "Đông Hưng", "Quỳnh Phụ", "Kiến Xương"]
            },
            {
              "name": "Thai Nguyen",
              "cities": ["Thái Nguyên", "Sông Công", "Phổ Yên", "Đại Từ"]
            },
            {
              "name": "Thanh Hoa",
              "cities": ["Thanh Hóa", "Sầm Sơn", "Bỉm Sơn", "Nghi Sơn"]
            },
            {
              "name": "Thua Thien-Hue",
              "cities": ["Huế", "Hương Thủy", "Hương Trà", "Phú Lộc"]
            },
            {
              "name": "Tien Giang",
              "cities": ["Mỹ Tho", "Gò Công", "Cai Lậy", "Châu Thành"]
            },
            {
              "name": "Tra Vinh",
              "cities": ["Trà Vinh", "Càng Long", "Cầu Kè", "Tiểu Cần"]
            },
            {
              "name": "Tuyen Quang",
              "cities": ["Tuyên Quang", "Sơn Dương", "Hàm Yên", "Chiêm Hóa"]
            },
            {
              "name": "Vinh Long",
              "cities": ["Vĩnh Long", "Bình Minh", "Tam Bình", "Trà Ôn"]
            },
            {
              "name": "Vinh Phuc",
              "cities": ["Vĩnh Yên", "Phúc Yên", "Bình Xuyên", "Lập Thạch"]
            },
            {
              "name": "Yen Bai",
              "cities": ["Yên Bái", "Nghĩa Lộ", "Lục Yên", "Văn Yên"]
            },
            {
              "name": "Can Tho",
              "cities": ["Cần Thơ", "Ninh Kiều", "Bình Thủy", "Cái Răng"]
            },
            {
              "name": "Da Nang",
              "cities": ["Đà Nẵng", "Liên Chiểu", "Thanh Khê", "Hải Châu"]
            },
            {
              "name": "Hai Phong",
              "cities": ["Hải Phòng", "Đồ Sơn", "Kiến An", "Thủy Nguyên"]
            },
            {
              "name": "Hanoi",
              "cities": ["Hà Nội", "Hoàn Kiếm", "Ba Đình", "Cầu Giấy"]
            },
            {
              "name": "Ho Chi Minh",
              "cities": ["Ho Chi Minh City", "District 1", "Bình Thạnh", "Tân Bình"]
            }
          ]
        },
        {
          "country": "Yemen",
          "states": [
            {
              "name": "Abyan",
              "cities": ["Zinjibar", "Ja'ar"]
            },
            {
              "name": "'Adan",
              "cities": ["Aden", "Al Mualla", "Crater"]
            },
            {
              "name": "Ad Dali'",
              "cities": ["Ad Dali'", "Qatabah"]
            },
            {
              "name": "Al Bayda'",
              "cities": ["Al Bayda'", "Rada'a"]
            },
            {
              "name": "Al Hudaydah",
              "cities": ["Al Hudaydah", "Bajil"]
            },
            {
              "name": "Al Jawf",
              "cities": ["Al Hazm", "Bart Al Anan"]
            },
            {
              "name": "Al Mahrah",
              "cities": ["Al Ghaydah", "Hawf"]
            },
            {
              "name": "Al Mahwit",
              "cities": ["Al Mahwit", "Shibam Kawkaban"]
            },
            {
              "name": "'Amran",
              "cities": ["Amran", "Harf Sufyan"]
            },
            {
              "name": "Dhamar",
              "cities": ["Dhamar", "Utmah"]
            },
            {
              "name": "Hadramawt",
              "cities": ["Mukalla", "Seiyun"]
            },
            {
              "name": "Hajjah",
              "cities": ["Hajjah", "Abs"]
            },
            {
              "name": "Ibb",
              "cities": ["Ibb", "Jibla"]
            },
            {
              "name": "Lahij",
              "cities": ["Lahij", "Al Hawtah"]
            },
            {
              "name": "Ma'rib",
              "cities": ["Ma'rib", "Harib"]
            },
            {
              "name": "Sa'dah",
              "cities": ["Sa'dah", "Razih"]
            },
            {
              "name": "San'a'",
              "cities": ["Sana'a"]
            },
            {
              "name": "Shabwah",
              "cities": ["Ataq", "Habban"]
            },
            {
              "name": "Ta'izz",
              "cities": ["Ta'izz", "Al Turbah"]
            }
          ]
        },
        {
          "country": "Zambia",
          "states": [
            {
              "name": "Central",
              "cities": ["Kabwe", "Mkushi"]
            },
            {
              "name": "Copperbelt",
              "cities": ["Ndola", "Kitwe"]
            },
            {
              "name": "Eastern",
              "cities": ["Chipata", "Katete"]
            },
            {
              "name": "Luapula",
              "cities": ["Mansa", "Samfya"]
            },
            {
              "name": "Lusaka",
              "cities": ["Lusaka", "Chongwe"]
            },
            {
              "name": "Northern",
              "cities": ["Kasama", "Mbala"]
            },
            {
              "name": "North-Western",
              "cities": ["Solwezi", "Mwinilunga"]
            },
            {
              "name": "Southern",
              "cities": ["Livingstone", "Mazabuka"]
            },
            {
              "name": "Western",
              "cities": ["Mongu", "Senanga"]
            }
          ]
        },
        {
          "country": "Zimbabwe",
          "states": [
            {
              "name": "Bulawayo",
              "cities": ["Bulawayo"]
            },
            {
              "name": "Harare",
              "cities": ["Harare", "Chitungwiza"]
            },
            {
              "name": "Manicaland",
              "cities": ["Mutare", "Rusape"]
            },
            {
              "name": "Mashonaland Central",
              "cities": ["Bindura", "Mt Darwin"]
            },
            {
              "name": "Mashonaland East",
              "cities": ["Marondera", "Murewa"]
            },
            {
              "name": "Mashonaland West",
              "cities": ["Chinhoyi", "Kadoma"]
            },
            {
              "name": "Masvingo",
              "cities": ["Masvingo", "Chiredzi"]
            },
            {
              "name": "Matabeleland North",
              "cities": ["Hwange", "Victoria Falls"]
            },
            {
              "name": "Matabeleland South",
              "cities": ["Gwanda", "Beitbridge"]
            },
            {
              "name": "Midlands",
              "cities": ["Gweru", "Kwekwe"]
            }
          ]
        }     
  ]

  export const getCitiesByState = (stateName: string) => {
    for (const country of statesToCities) {
      for (const state of country?.states) {
        if (state.name === stateName) {
          return state.cities;
        }
      }
    }
    return []
  }