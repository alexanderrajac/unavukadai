// Mock data for Unavukadai (Zomato-clone food delivery and dining app)
// Focused on South Chennai Suburban Hub: Perungalathur, Vandalur & Mannivakkam

export const CITIES = [
  { id: 'all-chennai', name: 'All Locations', locality: 'Chennai (All Areas)', area: 'Greater Chennai', isAll: true },
  { id: 'tnagar', name: 'T. Nagar', locality: 'T. Nagar & Pondy Bazaar', area: 'Central Chennai' },
  { id: 'annanagar', name: 'Anna Nagar', locality: 'Anna Nagar & Roundtana', area: 'North-West Chennai' },
  { id: 'velachery', name: 'Velachery', locality: 'Velachery & Phoenix Marketcity', area: 'South Chennai' },
  { id: 'adyar', name: 'Adyar', locality: 'Adyar & Besant Nagar', area: 'Coastal Chennai' },
  { id: 'omr', name: 'OMR', locality: 'OMR & Sholinganallur', area: 'IT Corridor' },
  { id: 'tambaram', name: 'Tambaram', locality: 'Tambaram Sanatorium & West', area: 'South Chennai' },
  { id: 'perungalathur', name: 'Perungalathur', locality: 'GST Road & Peerkankaranai', area: 'Perungalathur Hub', isSuburban: true },
  { id: 'vandalur', name: 'Vandalur', locality: 'Zoo Junction & Crescent Campus', area: 'Vandalur City', isSuburban: true },
  { id: 'mannivakkam', name: 'Mannivakkam', locality: 'Mannivakkam Junction & Mudichur Rd', area: 'Mannivakkam', isSuburban: true },
  { id: 'chn', name: 'Chennai Central', locality: 'T. Nagar, Chennai', area: 'Central Chennai' },
  { id: 'cbe', name: 'Coimbatore', locality: 'RS Puram, Coimbatore', area: 'City Centre' },
  { id: 'blr', name: 'Bengaluru', locality: 'Indiranagar, Bengaluru', area: 'East Bangalore' }
];

export const REGIONAL_OFFER_BANNERS = [
  {
    id: 'b-perungalathur',
    region: 'Perungalathur',
    title: 'Grand City Feast ⚡',
    subtitle: 'Flat 50% OFF up to ₹120 across all top biryani & dining spots',
    code: 'PERUNGAL50',
    color: 'linear-gradient(135deg, #e23744 0%, #b91c1c 100%)',
    badge: 'HOT DEAL'
  },
  {
    id: 'b-vandalur',
    region: 'Vandalur',
    title: 'Biryani & BBQ Carnival 🍗',
    subtitle: '60% OFF up to ₹150 for students & families across the city',
    code: 'VANDALUR60',
    color: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    badge: 'STUDENT & FAMILY FAVOURITE'
  },
  {
    id: 'b-mannivakkam',
    region: 'Mannivakkam',
    title: 'Traditional Tiffin & Village Mess 🌿',
    subtitle: 'Flat 40% OFF on authentic Naatu Kozhi & Ghee Roast Dosas',
    code: 'MANNIVAKKAM40',
    color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    badge: 'LOCAL AUTHENTIC'
  }
];

export const FOOD_CATEGORIES = [
  {
    id: 'biryani',
    name: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
    description: 'Dum & Seeraga Samba'
  },
  {
    id: 'dosa',
    name: 'Dosa & Tiffin',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80',
    description: 'Crispy & Ghee Roast'
  },
  {
    id: 'thali',
    name: 'South Thali',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=300&auto=format&fit=crop&q=80',
    description: 'Traditional Meals'
  },
  {
    id: 'shawarma',
    name: 'Shawarma & Grills',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&auto=format&fit=crop&q=80',
    description: 'Al-Faham & Rolls'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    description: 'Cheesy & Sourdough'
  },
  {
    id: 'burger',
    name: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    description: 'Juicy & Crispy'
  },
  {
    id: 'chettinad',
    name: 'Chettinad',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80',
    description: 'Spicy & Aromatic'
  },
  {
    id: 'chinese',
    name: 'Chinese',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80',
    description: 'Noodles & Momos'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80',
    description: 'Pastries & Halwa'
  },
  {
    id: 'coffee',
    name: 'Filter Coffee',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    description: 'Degree Kaapi & Chai'
  }
];

export const CURATED_COLLECTIONS = [
  {
    id: 'coll-suburban',
    title: 'Top Suburban Biryani Spots (GST Road)',
    placesCount: '16 Places',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    tag: 'Perungalathur & Vandalur'
  },
  {
    id: 'coll-1',
    title: 'Authentic Traditional Tiffin',
    placesCount: '24 Places',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    tag: 'Mannivakkam & Mudichur'
  },
  {
    id: 'coll-2',
    title: 'Late Night Delivery (till 3 AM)',
    placesCount: '14 Places',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    tag: 'Suburban Highway'
  },
  {
    id: 'coll-3',
    title: 'Campus Hangouts & Shawarma',
    placesCount: '11 Places',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
    tag: 'Vandalur Campus Hub'
  }
];

export const RESTAURANTS = [
  {
    id: 'res-perungalathur-1',
    name: 'SS Hyderabad Biryani',
    region: 'Perungalathur',
    cuisines: ['Biryani', 'Mughlai', 'Tandoori', 'Grill'],
    rating: 4.6,
    ratingCount: '14.2k',
    deliveryTime: '20-25 min',
    deliveryTimeMins: 22,
    distance: '1.2 km',
    costForTwo: 500,
    offer: '50% OFF up to ₹120 | Use PERUNGAL50',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    address: 'Near Bus Terminus, GST Road, Perungalathur',
    safetyScore: '4.9 Hygiene Certified',
    menu: [
      {
        id: 'ssh-1',
        name: 'Special Chicken Dum Biryani',
        price: 280,
        rating: 4.8,
        votes: 5200,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Aromatic basmati rice simmered with marinated tender chicken, saffron, boiled egg and rich brinjal dalcha.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'ssh-2',
        name: 'Mutton Dum Biryani',
        price: 360,
        rating: 4.7,
        votes: 4100,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Tender baby mutton cooked in authentic Hyderabadi dum style with fried onions, mint and fragrant whole spices.',
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'ssh-3',
        name: 'Pepper Barbecue Chicken (Half)',
        price: 240,
        rating: 4.6,
        votes: 1980,
        isVeg: false,
        inStock: true,
        category: 'Grills & Tandoori',
        description: 'Charcoal grilled chicken coated with fiery black pepper glaze and herbs.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
        bestSeller: false
      },
      {
        id: 'ssh-4',
        name: 'Chicken 65 (Boneless)',
        price: 210,
        rating: 4.7,
        votes: 2800,
        isVeg: false,
        inStock: true,
        category: 'Starters',
        description: 'Crispy deep-fried spicy marinated boneless chicken bites with curry leaves and green chillies.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-vandalur-1',
    name: 'Hotel Vandalur Ananda Bhavan',
    region: 'Vandalur',
    cuisines: ['South Indian', 'Pure Veg', 'Breakfast', 'Tiffin'],
    rating: 4.7,
    ratingCount: '11.8k',
    deliveryTime: '15-20 min',
    deliveryTimeMins: 18,
    distance: '0.8 km',
    costForTwo: 280,
    offer: '60% OFF up to ₹150 | Use VANDALUR60',
    pureVeg: true,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    address: 'Opposite Vandalur Zoo Main Gate, GST Road, Vandalur',
    safetyScore: '4.9 Fresh & Hygienic',
    menu: [
      {
        id: 'vab-1',
        name: 'Ghee Podi Roast Dosa',
        price: 130,
        rating: 4.9,
        votes: 4300,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Paper thin crispy golden dosa sprinkled with homemade aromatic spicy podi and pure country ghee.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'vab-2',
        name: 'Steamed Idli with 3 Chutneys (3 Pcs)',
        price: 65,
        rating: 4.8,
        votes: 3800,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Soft fluffy steamed idlis served with coconut chutney, tomato chutney, mint chutney and piping hot sambar.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'vab-3',
        name: 'Medu Vada (2 Pcs)',
        price: 70,
        rating: 4.7,
        votes: 2100,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Crispy fried lentil fritters with crushed black pepper, ginger and fresh curry leaves.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: false
      },
      {
        id: 'vab-4',
        name: 'Traditional South Indian Meals (Thali)',
        price: 160,
        rating: 4.6,
        votes: 2900,
        isVeg: true,
        inStock: true,
        category: 'Meals & Rice',
        description: 'Boiled ponni rice served with authentic sambar, kara kozhambu, rasam, kootu, poriyal, appalam and sweet payasam.',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'vab-5',
        name: 'Vandalur Filter Kaapi',
        price: 35,
        rating: 4.9,
        votes: 3100,
        isVeg: true,
        inStock: true,
        category: 'Beverages',
        description: 'Strong authentic decoction filter coffee frothed in traditional brass dabara.',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-mannivakkam-1',
    name: 'Mannivakkam Muniyandi Vilas',
    region: 'Mannivakkam',
    cuisines: ['Chettinad', 'Naatu Kozhi', 'Kari Dosa', 'Seafood'],
    rating: 4.5,
    ratingCount: '7.9k',
    deliveryTime: '25-30 min',
    deliveryTimeMins: 26,
    distance: '2.1 km',
    costForTwo: 450,
    offer: '40% OFF up to ₹100 | Use MANNIVAKKAM40',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    address: 'Near Mannivakkam Junction, Mudichur Road, Mannivakkam',
    safetyScore: '4.8 Village Style Fresh Cooking',
    menu: [
      {
        id: 'mmv-1',
        name: 'Naatu Kozhi Varuval (Country Chicken)',
        price: 290,
        rating: 4.8,
        votes: 2150,
        isVeg: false,
        inStock: true,
        category: 'Chettinad Specials',
        description: 'Free-range country chicken cooked with small shallots, hand-pounded pepper and roasted cumin.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'mmv-2',
        name: 'Special Mutton Kari Dosa',
        price: 240,
        rating: 4.7,
        votes: 1890,
        isVeg: false,
        inStock: true,
        category: 'Tiffin & Breads',
        description: 'Fluffy Kal Dosa layered with spicy egg omelette and succulent minced mutton gravy.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'mmv-3',
        name: 'Malabar Porotta (2 Pcs) with Salna',
        price: 60,
        rating: 4.6,
        votes: 3400,
        isVeg: true,
        inStock: true,
        category: 'Tiffin & Breads',
        description: 'Layered soft flaky porottas served with rich spicy empty salna and raita.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-vandalur-2',
    name: 'Crescent Shawarma & Arabian Grill',
    region: 'Vandalur',
    cuisines: ['Arabian', 'Shawarma', 'Mandi', 'Fast Food'],
    rating: 4.4,
    ratingCount: '9.3k',
    deliveryTime: '20-25 min',
    deliveryTimeMins: 22,
    distance: '1.5 km',
    costForTwo: 400,
    offer: 'Buy 2 Jumbo Shawarmas Get 1 Free',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80',
    address: 'Near Crescent Institute Gate, Kelambakkam Road, Vandalur',
    safetyScore: '4.8 Tamper Proof Packaging',
    menu: [
      {
        id: 'csg-1',
        name: 'Jumbo Rumali Chicken Shawarma Roll',
        price: 150,
        rating: 4.7,
        votes: 4800,
        isVeg: false,
        inStock: true,
        category: 'Shawarma Rolls',
        description: 'Slow-roasted rotisserie chicken packed in thin soft rumali roti with pickled veggies and house garlic toum.',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'csg-2',
        name: 'Chicken Al-Faham (Quarter)',
        price: 170,
        rating: 4.6,
        votes: 2100,
        isVeg: false,
        inStock: true,
        category: 'Arabian Grills',
        description: 'Tender chicken marinated in Arabian spice rub, grilled over open coals and served with kuboos.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-mannivakkam-2',
    name: 'Mudichur Royal Kitchen',
    region: 'Mannivakkam',
    cuisines: ['North Indian', 'Chinese', 'Burgers', 'Rolls'],
    rating: 4.3,
    ratingCount: '4.2k',
    deliveryTime: '25-30 min',
    deliveryTimeMins: 27,
    distance: '2.4 km',
    costForTwo: 380,
    offer: 'Flat ₹75 OFF on orders above ₹299',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    address: 'Near Walajabad Road, Mannivakkam',
    safetyScore: '4.7 Verified Kitchen',
    menu: [
      {
        id: 'mrk-1',
        name: 'Paneer Butter Masala Combo with 2 Naan',
        price: 210,
        rating: 4.5,
        votes: 1600,
        isVeg: true,
        inStock: true,
        category: 'Combos',
        description: 'Soft cottage cheese simmered in creamy butter gravy paired with warm butter naan.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'mrk-2',
        name: 'Schezwan Chicken Fried Rice',
        price: 190,
        rating: 4.4,
        votes: 1850,
        isVeg: false,
        inStock: true,
        category: 'Chinese & Wok',
        description: 'Wok tossed aromatic rice with spicy Schezwan sauce, egg, and fried chicken strips.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-perungalathur-2',
    name: 'Dindigul Thalappakatti (Perungalathur)',
    region: 'Perungalathur',
    cuisines: ['Biryani', 'South Indian', 'Mutton Chukka'],
    rating: 4.5,
    ratingCount: '15.6k',
    deliveryTime: '25-30 min',
    deliveryTimeMins: 28,
    distance: '1.8 km',
    costForTwo: 550,
    offer: '50% OFF up to ₹120 | Use PERUNGAL50',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    address: 'Near Railway Station Overbridge, GST Road, Perungalathur',
    safetyScore: '4.8 Heritage Restaurant',
    menu: [
      {
        id: 'dtp-1',
        name: 'Thalappakatti Mutton Biryani',
        price: 360,
        rating: 4.7,
        votes: 4200,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Authentic Seeraga samba rice cooked with tender mutton pieces and secret hand-ground spices.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-tnagar-1',
    name: 'Sangeetha Veg Restaurant',
    region: 'T. Nagar',
    cuisines: ['South Indian', 'Pure Veg', 'North Indian', 'Breakfast'],
    rating: 4.7,
    ratingCount: '28.4k',
    deliveryTime: '20-25 min',
    deliveryTimeMins: 20,
    distance: '1.4 km',
    costForTwo: 350,
    offer: '50% OFF up to ₹100 | Use UNAVU50',
    pureVeg: true,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    address: 'G.N. Chetty Road, T. Nagar, Chennai',
    safetyScore: '4.9 Gold Standard Kitchen',
    menu: [
      {
        id: 'sng-1',
        name: 'Special Ghee Roast Dosa',
        price: 140,
        rating: 4.9,
        votes: 5600,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Golden crispy conical dosa drenched in pure melted ghee, served with 3 signature chutneys and sambar.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'sng-2',
        name: 'Executive South Indian Mini Tiffin',
        price: 180,
        rating: 4.8,
        votes: 4200,
        isVeg: true,
        inStock: true,
        category: 'Combos',
        description: 'Delightful platter featuring mini masala dosa, 1 idli, 1 medu vada, sweet kesari, rava khichdi and filter coffee.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-tnagar-2',
    name: 'Junior Kuppanna',
    region: 'T. Nagar',
    cuisines: ['Kongu Nadu', 'Biryani', 'South Indian', 'Mutton Chukka'],
    rating: 4.6,
    ratingCount: '19.2k',
    deliveryTime: '25-30 min',
    deliveryTimeMins: 25,
    distance: '2.1 km',
    costForTwo: 550,
    offer: 'Flat ₹100 OFF on orders above ₹399',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    address: 'Venkatnarayana Road, T. Nagar, Chennai',
    safetyScore: '4.8 Kongu Authentic Cuisine',
    menu: [
      {
        id: 'jk-1',
        name: 'Kongu Seeraga Samba Mutton Biryani',
        price: 380,
        rating: 4.8,
        votes: 4800,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Iconic tiny grain Seeraga Samba rice cooked in rich bone marrow broth with juicy succulent mutton pieces.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'jk-2',
        name: 'Pallipalayam Chicken Dry',
        price: 270,
        rating: 4.7,
        votes: 3100,
        isVeg: false,
        inStock: true,
        category: 'Starters',
        description: 'Tender chicken tossed with shallots, dried red chillies and fresh grated coconut ribbons.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-annanagar-1',
    name: 'Anjappar Chettinad Restaurant',
    region: 'Anna Nagar',
    cuisines: ['Chettinad', 'Biryani', 'Seafood', 'South Indian'],
    rating: 4.6,
    ratingCount: '22.8k',
    deliveryTime: '20-30 min',
    deliveryTimeMins: 24,
    distance: '1.8 km',
    costForTwo: 500,
    offer: '50% OFF up to ₹100 | Use UNAVU50',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    address: '2nd Avenue, Roundtana, Anna Nagar, Chennai',
    safetyScore: '4.8 Heritage Chettinad Kitchen',
    menu: [
      {
        id: 'anj-1',
        name: 'Chettinad Chicken Pepper Masala',
        price: 280,
        rating: 4.8,
        votes: 3900,
        isVeg: false,
        inStock: true,
        category: 'Curries & Gravies',
        description: 'Spicy semi-gravy chicken cooked in roasted stone-ground Chettinad spices, black pepper and curry leaves.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'anj-2',
        name: 'Anjappar Mutton Dum Biryani',
        price: 370,
        rating: 4.7,
        votes: 4100,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Traditional wood-fired dum biryani with fragrant spices and tender mutton, served with raita and brinjal curry.',
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-adyar-1',
    name: 'A2B - Adyar Ananda Bhavan',
    region: 'Adyar',
    cuisines: ['South Indian', 'Pure Veg', 'Sweets & Chaat', 'Tiffin'],
    rating: 4.7,
    ratingCount: '31.5k',
    deliveryTime: '15-20 min',
    deliveryTimeMins: 18,
    distance: '1.2 km',
    costForTwo: 300,
    offer: 'Free Delivery over ₹200 | Use FREEDEL',
    pureVeg: true,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    address: 'Lattice Bridge Road, Adyar, Chennai',
    safetyScore: '4.9 Certified Clean & Fresh',
    menu: [
      {
        id: 'a2b-1',
        name: 'Ghee Podi Mini Idli (14 Pcs)',
        price: 120,
        rating: 4.9,
        votes: 6200,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Bite-sized soft steamed mini idlis tossed in pure desi ghee and spicy aromatic gun-powder podi.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'a2b-2',
        name: 'Special Chola Poori with Chana Masala',
        price: 150,
        rating: 4.8,
        votes: 4400,
        isVeg: true,
        inStock: true,
        category: 'Tiffin Specials',
        description: 'Gigantic puffed golden bhatura served with spicy Punjabi chana masala, pickle and sliced onions.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-annanagar-2',
    name: 'Buhari Hotel (Since 1951)',
    region: 'Anna Nagar',
    cuisines: ['Mughlai', 'Biryani', 'Starters', 'Grills'],
    rating: 4.5,
    ratingCount: '17.3k',
    deliveryTime: '25-35 min',
    deliveryTimeMins: 28,
    distance: '2.5 km',
    costForTwo: 600,
    offer: 'Flat 20% OFF | Use UNAVU50',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    address: '3rd Avenue, Anna Nagar East, Chennai',
    safetyScore: '4.8 Legendary Food Pioneer',
    menu: [
      {
        id: 'bhr-1',
        name: 'Original 1965 Chicken 65',
        price: 260,
        rating: 4.9,
        votes: 7500,
        isVeg: false,
        inStock: true,
        category: 'Starters',
        description: 'The world-famous deep-fried chicken created at Buhari in 1965, crispy outside and succulent inside.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'bhr-2',
        name: 'Buhari Mutton Dum Biryani',
        price: 360,
        rating: 4.7,
        votes: 5100,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Classic Madras style dum biryani layered with aromatic spices, boiled egg and melt-in-mouth mutton.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-omr-1',
    name: 'Toscano Wood-Fired Pizzeria',
    region: 'OMR',
    cuisines: ['Italian', 'Pizza', 'Pasta', 'Desserts'],
    rating: 4.7,
    ratingCount: '12.1k',
    deliveryTime: '30-40 min',
    deliveryTimeMins: 32,
    distance: '3.0 km',
    costForTwo: 800,
    offer: 'Free Delivery over ₹200 | Use FREEDEL',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    address: 'Old Mahabalipuram Road, Sholinganallur, Chennai',
    safetyScore: '4.9 Italian Master Chef Certified',
    menu: [
      {
        id: 'tsc-1',
        name: 'Truffle Margherita Pizza (12 Inch)',
        price: 460,
        rating: 4.8,
        votes: 2900,
        isVeg: true,
        inStock: true,
        category: 'Wood-Fired Pizza',
        description: 'San Marzano tomato sauce, fresh mozzarella fior di latte, basil and aromatic black truffle oil.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'tsc-2',
        name: 'Creamy Fettuccine Alfredo with Chicken',
        price: 420,
        rating: 4.7,
        votes: 2100,
        isVeg: false,
        inStock: true,
        category: 'Pasta',
        description: 'Fresh artisanal egg pasta tossed in a velvety parmesan cream sauce with grilled herb chicken.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-velachery-1',
    name: 'Copper Chimney',
    region: 'Velachery',
    cuisines: ['North Indian', 'Kebabs', 'Mughlai', 'Biryani'],
    rating: 4.6,
    ratingCount: '14.5k',
    deliveryTime: '25-35 min',
    deliveryTimeMins: 27,
    distance: '2.2 km',
    costForTwo: 750,
    offer: 'Flat ₹150 OFF on orders above ₹599',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    address: '100 Feet Bypass Road, Velachery, Chennai',
    safetyScore: '4.8 Royal North Indian Cooking',
    menu: [
      {
        id: 'cc-1',
        name: 'Reshmi Malai Chicken Tikka',
        price: 340,
        rating: 4.8,
        votes: 2700,
        isVeg: false,
        inStock: true,
        category: 'Tandoor Grills',
        description: 'Boneless chicken supreme marinated in creamy hung curd, cashew paste and mild royal cardamom.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'cc-2',
        name: 'Dal Maharaja with 2 Butter Naan',
        price: 290,
        rating: 4.9,
        votes: 3600,
        isVeg: true,
        inStock: true,
        category: 'Curries',
        description: 'Black lentils slow cooked overnight on slow embers with fresh cream and butter.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  },
  {
    id: 'res-tambaram-1',
    name: 'Salem RR Briyani Unavagam',
    region: 'Tambaram',
    cuisines: ['Biryani', 'South Indian', 'Chettinad', 'Tandoori'],
    rating: 4.5,
    ratingCount: '21.0k',
    deliveryTime: '20-25 min',
    deliveryTimeMins: 22,
    distance: '1.6 km',
    costForTwo: 480,
    offer: '50% OFF up to ₹120 | Use UNAVU50',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    address: 'Shanmugam Road, West Tambaram, Chennai',
    safetyScore: '4.8 Fire-Pot Heritage Biryani',
    menu: [
      {
        id: 'srr-1',
        name: 'Salem RR Special Chicken Biryani',
        price: 270,
        rating: 4.7,
        votes: 5200,
        isVeg: false,
        inStock: true,
        category: 'Biryani Specials',
        description: 'Authentic Salem fire-pot biryani cooked with farm fresh chicken and spicy traditional masala.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      },
      {
        id: 'srr-2',
        name: 'Madras Pepper Chicken Fry',
        price: 220,
        rating: 4.6,
        votes: 2400,
        isVeg: false,
        inStock: true,
        category: 'Starters',
        description: 'Fiery chicken roast with crushed Tellicherry black pepper, shallots and fried curry leaves.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
        bestSeller: true
      }
    ]
  }
];

export const COUPONS = [
  { code: 'PERUNGAL50', region: 'Perungalathur', discountPercent: 50, maxDiscount: 120, minOrder: 199, label: '50% OFF up to ₹120 (Perungalathur)' },
  { code: 'VANDALUR60', region: 'Vandalur', discountPercent: 60, maxDiscount: 150, minOrder: 199, label: '60% OFF up to ₹150 (Vandalur)' },
  { code: 'MANNIVAKKAM40', region: 'Mannivakkam', discountPercent: 40, maxDiscount: 100, minOrder: 149, label: '40% OFF up to ₹100 (Mannivakkam)' },
  { code: 'UNAVU50', discountPercent: 50, maxDiscount: 100, minOrder: 199, label: '50% OFF up to ₹100 (All Zones)' },
  { code: 'FREEDEL', discountAmount: 35, minOrder: 200, label: 'Free Delivery over ₹200' }
];

export const INITIAL_ORDERS = [
  {
    orderId: 'UNV-784102',
    customerName: 'Raja Official',
    customerEmail: 'rajacofficial369@gmail.com',
    customerPhone: '+91 98401 23456',
    restaurantId: 'res-perungalathur-1',
    restaurantName: 'SS Hyderabad Biryani',
    restaurantAddress: 'GST Road, Perungalathur',
    customerAddress: 'Peerkankaranai Main Rd, Perungalathur',
    locality: 'Perungalathur',
    items: [
      { id: 'ssh-1', name: 'Special Chicken Dum Biryani', price: 280, quantity: 2 },
      { id: 'ssh-4', name: 'Chicken 65 (Boneless)', price: 210, quantity: 1 }
    ],
    itemTotal: 770,
    deliveryFee: 35,
    platformFee: 5,
    taxes: 38,
    discount: 120,
    grandTotal: 728,
    status: 'PREPARING', // 'PLACED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    deliveryOtp: '4821',
    riderId: 'rider-1',
    riderName: 'Murugan S.',
    riderPhone: '+91 98765 43210',
    riderEarnings: 65,
    placedAt: '12 mins ago',
    etaMins: 16
  },
  {
    orderId: 'UNV-649201',
    customerName: 'Alexander Raja',
    customerEmail: 'alexanderrajac@gmail.com',
    customerPhone: '+91 98401 23456',
    restaurantId: 'res-vandalur-1',
    restaurantName: 'Hotel Vandalur Ananda Bhavan',
    restaurantAddress: 'Opposite Zoo Gate, Vandalur',
    customerAddress: 'Crescent Campus Staff Quarters, Vandalur',
    locality: 'Vandalur',
    items: [
      { id: 'vab-1', name: 'Ghee Podi Roast Dosa', price: 130, quantity: 2 },
      { id: 'vab-5', name: 'Vandalur Filter Kaapi', price: 35, quantity: 2 }
    ],
    itemTotal: 330,
    deliveryFee: 35,
    platformFee: 5,
    taxes: 16,
    discount: 150,
    grandTotal: 236,
    status: 'READY_FOR_PICKUP',
    deliveryOtp: '7192',
    riderId: null,
    riderName: null,
    riderPhone: null,
    riderEarnings: 55,
    placedAt: '18 mins ago',
    etaMins: 10
  },
  {
    orderId: 'UNV-512803',
    customerName: 'Raja Official',
    customerEmail: 'rajacofficial369@gmail.com',
    customerPhone: '+91 98401 23456',
    restaurantId: 'res-mannivakkam-1',
    restaurantName: 'Mannivakkam Muniyandi Vilas',
    restaurantAddress: 'Near Junction, Mudichur Rd, Mannivakkam',
    customerAddress: 'Sri Venkateswara Nagar, Mannivakkam',
    locality: 'Mannivakkam',
    items: [
      { id: 'mmv-1', name: 'Naatu Kozhi Varuval', price: 290, quantity: 1 },
      { id: 'mmv-3', name: 'Malabar Porotta (2 Pcs)', price: 60, quantity: 2 }
    ],
    itemTotal: 410,
    deliveryFee: 35,
    platformFee: 5,
    taxes: 20,
    discount: 100,
    grandTotal: 370,
    status: 'DELIVERED',
    deliveryOtp: '3350',
    riderId: 'rider-2',
    riderName: 'Anand Kumar',
    riderPhone: '+91 98840 99881',
    riderEarnings: 60,
    placedAt: '42 mins ago',
    etaMins: 0
  },
  {
    orderId: 'UNV-401928',
    customerName: 'Alexander Raja',
    customerEmail: 'alexanderrajac@gmail.com',
    customerPhone: '+91 98401 23456',
    restaurantId: 'res-perungalathur-2',
    restaurantName: 'Junior Kuppanna',
    restaurantAddress: 'Near Railway Station, Perungalathur',
    customerAddress: 'Flat 4B, Sri Sai Flats, Peerkankaranai Main Road, Perungalathur',
    locality: 'Perungalathur',
    items: [
      { id: 'jk-1', name: 'Kongu Mutton Biryani', price: 340, quantity: 1 },
      { id: 'jk-3', name: 'Pallipalayam Chicken Fry', price: 230, quantity: 1 }
    ],
    itemTotal: 570,
    deliveryFee: 28,
    platformFee: 5,
    taxes: 28,
    discount: 50,
    grandTotal: 581,
    status: 'DELIVERED',
    deliveryOtp: '5521',
    riderId: 'rider-1',
    riderName: 'Murugan S.',
    riderPhone: '+91 98765 43210',
    riderEarnings: 65,
    placedAt: '2 hours ago',
    etaMins: 0
  }
];
