/**
 * Seed script — populates the database with dummy recipe data for development.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Safe to run multiple times — uses onConflictDoNothing so existing rows
 * are left untouched.
 */
import { config } from 'dotenv';
import { resolve } from 'path';

import { db } from './client';
import { recipes, users } from './schema/index';

config({ path: resolve(process.cwd(), '../../apps/api/.env') });

// ── Seed user ─────────────────────────────────────────────────────────────────
// A fake user that owns the seed recipes. In real usage recipes are owned
// by Clerk users, but for seeding we insert a placeholder.

const SEED_USER_ID = 'seed_user_001';
const SEED_USER = {
  id: SEED_USER_ID,
  email: 'seed@example.com',
  firstName: 'Seed',
  lastName: 'Chef',
  imageUrl: null,
};

// ── Seed recipes ──────────────────────────────────────────────────────────────

const SEED_RECIPES = [
  {
    title: 'Classic Spaghetti Carbonara',
    description:
      'A rich and creamy Roman pasta made with eggs, Pecorino Romano, guanciale, and black pepper. No cream — the sauce is emulsified from eggs and cheese alone.',
    ingredients: [
      '400g spaghetti',
      '200g guanciale or pancetta',
      '4 egg yolks',
      '1 whole egg',
      '100g Pecorino Romano, finely grated',
      'Freshly ground black pepper',
      'Salt for pasta water',
    ],
    instructions:
      'Bring a large pot of salted water to a boil and cook spaghetti until al dente.\nMeanwhile, cook guanciale in a large skillet over medium heat until crispy. Remove from heat.\nWhisk egg yolks, whole egg, and Pecorino together in a bowl. Season generously with black pepper.\nDrain pasta, reserving 1 cup pasta water. Add hot pasta to the skillet with guanciale off the heat.\nPour egg mixture over pasta, tossing rapidly and adding pasta water a splash at a time to create a silky sauce.\nServe immediately with extra Pecorino and black pepper.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'italian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXnbhYE5peY6Zh8lSUkHDnpzNWwjyXamcruFR3',
  },
  {
    title: 'Chicken Tikka Masala',
    description:
      "Tender marinated chicken in a creamy, spiced tomato sauce. A beloved British-Indian classic that's surprisingly straightforward to make at home.",
    ingredients: [
      '800g chicken thighs, cubed',
      '200ml plain yogurt',
      '2 tsp garam masala',
      '1 tsp turmeric',
      '1 tsp cumin',
      '400ml tomato passata',
      '200ml double cream',
      '1 large onion',
      '4 garlic cloves',
      '2cm fresh ginger',
      '2 tbsp butter',
      'Salt to taste',
      'Fresh coriander to serve',
    ],
    instructions:
      'Marinate chicken in yogurt, half the spices, and salt for at least 1 hour.\nGrill or pan-fry chicken until charred at the edges. Set aside.\nSauté onion in butter until golden. Add garlic and ginger, cook 2 minutes.\nAdd remaining spices and cook 1 minute until fragrant.\nAdd passata and simmer 15 minutes. Blend sauce until smooth.\nReturn to pan, add cream and chicken. Simmer 10 minutes.\nGarnish with coriander and serve with basmati rice or naan.',
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'indian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXJhG6zpb67jagNF0pdElZT514rfVOHXoLzPYG',
  },
  {
    title: 'Beef Tacos al Pastor',
    description:
      'Juicy marinated pork cooked on a vertical spit, served in small corn tortillas with pineapple, onion, and cilantro. Street food perfection.',
    ingredients: [
      '1kg pork shoulder, thinly sliced',
      '3 dried guajillo chiles',
      '2 dried ancho chiles',
      '4 garlic cloves',
      '1 tsp cumin',
      '1 tsp oregano',
      '200ml pineapple juice',
      '2 tbsp apple cider vinegar',
      'Small corn tortillas',
      'Pineapple chunks',
      'White onion, finely diced',
      'Fresh cilantro',
      'Lime wedges',
    ],
    instructions:
      'Toast dried chiles in a dry pan until fragrant. Soak in hot water 20 minutes.\nBlend softened chiles with garlic, spices, pineapple juice, and vinegar into a smooth marinade.\nCoat pork slices in marinade and refrigerate overnight.\nCook pork in a hot cast-iron pan or grill in batches until caramelised.\nChop into small pieces and serve on warm corn tortillas.\nTop with pineapple, onion, cilantro, and a squeeze of lime.',
    prepTimeMinutes: 30,
    cookTimeMinutes: 20,
    servings: 6,
    difficulty: 'hard' as const,
    cuisine: 'mexican' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXeDH50Nvz4Zb7KWxlqy2ni53cg8kYRPuDVsp6',
  },
  {
    title: 'French Onion Soup',
    description:
      'Deeply caramelised onions in a rich beef broth, topped with crusty bread and melted Gruyère. Low effort, high reward — the key is patience with the onions.',
    ingredients: [
      '1.5kg yellow onions, thinly sliced',
      '4 tbsp butter',
      '1 tbsp olive oil',
      '1 tsp sugar',
      '250ml dry white wine',
      '1.5L good beef stock',
      'Fresh thyme',
      'Bay leaf',
      'Baguette slices',
      '200g Gruyère, grated',
      'Salt and pepper',
    ],
    instructions:
      'Melt butter with oil in a large heavy pot. Add onions and cook on low heat, stirring occasionally, for 45–60 minutes until deeply golden and caramelised.\nAdd sugar and cook 5 more minutes. Deglaze with wine, scraping up any bits.\nAdd stock, thyme, and bay leaf. Simmer 20 minutes. Season well.\nLadle into oven-safe bowls. Top with baguette slices and a generous layer of Gruyère.\nBroil until cheese is bubbling and golden. Serve immediately.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 90,
    servings: 4,
    difficulty: 'easy' as const,
    cuisine: 'french' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXmIZySLT49JhPzLXMFTed30ZInbkxqO7iQ5fu',
  },
  {
    title: 'Pad Thai',
    description:
      "Thailand's most famous noodle dish — rice noodles stir-fried with egg, tofu or shrimp, bean sprouts, and a tangy tamarind sauce.",
    ingredients: [
      '300g flat rice noodles',
      '200g firm tofu or shrimp',
      '3 eggs',
      '100g bean sprouts',
      '4 spring onions',
      '3 tbsp tamarind paste',
      '2 tbsp fish sauce',
      '1 tbsp palm sugar or brown sugar',
      '2 tbsp vegetable oil',
      'Roasted peanuts, crushed',
      'Lime wedges',
      'Dried chilli flakes',
    ],
    instructions:
      'Soak rice noodles in cold water for 30 minutes. Drain.\nMix tamarind, fish sauce, and sugar in a small bowl. Set aside.\nHeat wok over high heat. Fry tofu or shrimp until golden. Push to the side.\nAdd noodles and sauce. Toss to coat.\nPush noodles aside, crack eggs in, scramble lightly, then mix through noodles.\nAdd bean sprouts and spring onions. Toss briefly — sprouts should stay crunchy.\nServe topped with peanuts, lime, and chilli flakes.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'medium' as const,
    cuisine: 'asian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXQPzUKDFax7iyZSA6MwrEdops9cnTmXkPNYfU',
  },
  {
    title: 'Shakshuka',
    description:
      'Eggs poached directly in a spiced tomato and pepper sauce. A Middle Eastern breakfast staple that works equally well for dinner.',
    ingredients: [
      '6 eggs',
      '2 cans (800g) crushed tomatoes',
      '2 red peppers, diced',
      '1 large onion, diced',
      '4 garlic cloves, minced',
      '1 tsp cumin',
      '1 tsp smoked paprika',
      '½ tsp cayenne',
      '1 tsp sugar',
      '2 tbsp olive oil',
      'Fresh parsley or coriander',
      'Feta cheese (optional)',
      'Crusty bread to serve',
    ],
    instructions:
      'Heat olive oil in a large oven-safe skillet. Sauté onion and pepper until soft, about 8 minutes.\nAdd garlic and spices, cook 1 minute until fragrant.\nAdd tomatoes and sugar, season with salt. Simmer 15 minutes until sauce thickens.\nUsing a spoon, make 6 wells in the sauce. Crack an egg into each well.\nCover and cook on low heat for 8–10 minutes until whites are set but yolks are still runny.\nScatter parsley and feta. Serve directly from the pan with plenty of bread.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 3,
    difficulty: 'easy' as const,
    cuisine: 'mediterranean' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXgBQNOWd5aD2XwiUFgJ1MZ0kW4CuoLy8b7rn9',
  },
  {
    title: 'Smash Burgers',
    description:
      'Thin, crispy-edged beef patties smashed onto a screaming hot griddle. The technique creates maximum crust and juiciness — far better than thick patties.',
    ingredients: [
      '600g 80/20 ground beef',
      '6 burger buns',
      'American cheese slices',
      'White onion, finely diced',
      'Pickles',
      'Mustard and ketchup',
      'Salt and pepper',
      'Butter for toasting buns',
    ],
    instructions:
      "Divide beef into 100g balls. Don't overwork the meat.\nHeat a cast-iron skillet or griddle over very high heat until smoking.\nToast buns in butter until golden. Set aside.\nPlace beef balls on griddle and immediately smash flat with a spatula or press.\nSeason with salt and pepper. Cook 2 minutes without touching.\nFlip, add cheese, cook 1 minute.\nBuild burgers: sauce, pickles, onion, double patty. Serve immediately.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 3,
    difficulty: 'easy' as const,
    cuisine: 'american' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXBhldIpsIxE7yhZQaplUf916KtuWqkHwdPFr8',
  },
  {
    title: 'Risotto ai Funghi',
    description:
      'Creamy Arborio rice with porcini and mixed mushrooms, finished with Parmesan and butter. The stirring is meditative, not laborious.',
    ingredients: [
      '320g Arborio rice',
      '30g dried porcini mushrooms',
      '400g mixed fresh mushrooms',
      '1 shallot, finely diced',
      '2 garlic cloves',
      '150ml dry white wine',
      '1.2L warm chicken or vegetable stock',
      '80g Parmesan, grated',
      '50g cold butter, cubed',
      'Fresh thyme',
      '2 tbsp olive oil',
      'Salt and pepper',
    ],
    instructions:
      'Soak porcini in 300ml hot water for 20 minutes. Drain, reserving soaking liquid. Chop porcini.\nSauté shallot in olive oil until translucent. Add garlic and thyme.\nAdd Arborio and toast for 2 minutes, stirring constantly.\nAdd wine and stir until absorbed.\nAdd warm stock one ladle at a time, stirring until absorbed before adding the next. This takes about 18 minutes.\nHalfway through, add the porcini, fresh mushrooms, and strained soaking liquid.\nWhen rice is al dente, remove from heat. Beat in cold butter and Parmesan vigorously. Rest 2 minutes before serving.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'italian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EX81U06jK2gI8t4LBXqilvbASkDzVaoOPR5NME',
  },
  {
    title: 'Guacamole',
    description:
      'Simple, fresh avocado dip. The key is ripe avocados, good lime juice, and not over-mixing — it should be chunky.',
    ingredients: [
      '3 ripe avocados',
      '1 lime, juiced',
      '½ small red onion, finely diced',
      '1 jalapeño, finely diced',
      'Small bunch of coriander, chopped',
      '½ tsp cumin',
      'Salt to taste',
    ],
    instructions:
      'Halve and pit avocados. Scoop flesh into a bowl.\nAdd lime juice immediately to prevent browning.\nMash roughly with a fork — leave some texture.\nFold in onion, jalapeño, coriander, and cumin.\nSeason generously with salt. Taste and adjust lime.\nServe immediately or press cling film directly on surface to store.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: 'easy' as const,
    cuisine: 'mexican' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXVFX6kD4MG7kqBgla3AX0wbUcHMzfS2JmPjIn',
  },
  {
    title: 'Beef Bourguignon',
    description:
      'The ultimate French braise — beef slow-cooked in red wine with lardons, mushrooms, and pearl onions. Better made the day before.',
    ingredients: [
      '1.5kg beef chuck, cut into large cubes',
      '750ml red Burgundy wine',
      '200g lardons or thick-cut bacon',
      '250g button mushrooms',
      '200g pearl onions',
      '4 carrots, chunked',
      '4 garlic cloves',
      '2 tbsp tomato paste',
      'Bouquet garni (thyme, bay, parsley)',
      '2 tbsp flour',
      '2 tbsp butter',
      'Olive oil',
      'Salt and pepper',
    ],
    instructions:
      'Marinate beef in wine overnight with carrots, garlic, and bouquet garni.\nRemove beef and pat dry. Strain marinade, reserving liquid.\nBrown beef in batches in oil and butter. Set aside.\nCook lardons until crisp. Add tomato paste, cook 1 minute.\nReturn beef, add reserved marinade. Bring to a simmer.\nCover and cook in a 160°C oven for 2.5–3 hours until beef is very tender.\nMeanwhile, brown pearl onions and mushrooms separately in butter.\nAdd to the braise for the final 30 minutes. Adjust seasoning before serving.',
    prepTimeMinutes: 30,
    cookTimeMinutes: 180,
    servings: 6,
    difficulty: 'hard' as const,
    cuisine: 'french' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXgFvkvvd5aD2XwiUFgJ1MZ0kW4CuoLy8b7rn9',
  },
  {
    title: 'Miso Ramen',
    description:
      'A rich, warming Japanese noodle soup with a deeply savoury miso broth, soft-boiled eggs, and a variety of toppings.',
    ingredients: [
      '4 portions ramen noodles',
      '4 tbsp white miso paste',
      '1L chicken or pork stock',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '1 tbsp mirin',
      '4 eggs',
      '200g pork belly or chicken, sliced',
      'Spring onions',
      'Nori sheets',
      'Bamboo shoots (optional)',
      'Corn kernels (optional)',
      'Bean sprouts',
    ],
    instructions:
      "Soft-boil eggs for exactly 7 minutes, then transfer to ice water. Peel and halve.\nWhisk miso with a little warm stock until smooth. Combine with remaining stock, soy, mirin, and sesame oil. Simmer gently — don't boil miso.\nCook noodles according to packet. Drain.\nSear pork belly or chicken until golden. Slice.\nDivide noodles into bowls. Ladle hot broth over.\nTop with sliced meat, halved eggs, spring onions, nori, and any other toppings.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'asian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXwE6eqemY26EodLUWR3AXxQ1wCGOsN4eVDiz7',
  },
  {
    title: 'Focaccia',
    description:
      'Pillowy, olive-oil-drenched Italian flatbread with a crispy bottom and dimpled top. The overnight cold ferment develops incredible flavour.',
    ingredients: [
      '500g strong bread flour',
      '375ml lukewarm water',
      '7g instant yeast',
      '1 tsp honey',
      '10g salt',
      '100ml good olive oil',
      'Flaky sea salt',
      'Fresh rosemary',
      'Optional: olives, cherry tomatoes',
    ],
    instructions:
      'Mix flour, yeast, honey, and water. Rest 30 minutes.\nAdd salt and 2 tbsp olive oil. Knead or stretch-and-fold for 10 minutes.\nCover and refrigerate overnight (12–24 hours).\nNext day: pour 3 tbsp olive oil into a 30x40cm baking tin. Transfer dough, turning to coat.\nDimple the surface all over with oiled fingers. Scatter rosemary and toppings. Drizzle with remaining oil. Rest 2 hours at room temperature.\nBake at 220°C for 20–25 minutes until deep golden.\nDrizzle with a little more olive oil and scatter flaky salt as soon as it comes out.',
    prepTimeMinutes: 30,
    cookTimeMinutes: 25,
    servings: 8,
    difficulty: 'medium' as const,
    cuisine: 'italian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXgn83UGKd5aD2XwiUFgJ1MZ0kW4CuoLy8b7rn',
  },
  {
    title: 'Greek Salad',
    description:
      'A simple, vibrant salad of tomatoes, cucumber, olives, and feta. No lettuce — the vegetables are the star.',
    ingredients: [
      '4 large ripe tomatoes, chunked',
      '1 cucumber, chunked',
      '1 red onion, thinly sliced',
      '200g Kalamata olives',
      '200g block feta cheese',
      '1 green pepper, sliced',
      '4 tbsp good olive oil',
      '1 tbsp red wine vinegar',
      '1 tsp dried oregano',
      'Salt and pepper',
    ],
    instructions:
      'Combine tomatoes, cucumber, onion, olives, and green pepper in a large bowl.\nDrizzle with olive oil and vinegar. Season with salt and pepper.\nPlace the block of feta on top whole — do not crumble.\nDrizzle a little extra oil over the feta and scatter oregano generously.\nServe immediately with crusty bread.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: 'easy' as const,
    cuisine: 'mediterranean' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXQJgmPbFax7iyZSA6MwrEdops9cnTmXkPNYfU',
  },
  {
    title: 'Butter Chicken',
    description:
      "Murgh makhani — tender chicken in a velvety, mildly spiced tomato and butter sauce. One of India's most beloved exports.",
    ingredients: [
      '800g chicken thighs',
      '200g plain yogurt',
      '2 tsp tandoori masala',
      '400g tomato passata',
      '100g butter',
      '200ml double cream',
      '1 large onion',
      '4 garlic cloves',
      '2cm ginger',
      '1 tsp garam masala',
      '1 tsp cumin',
      '1 tsp kashmiri chilli powder',
      '1 tbsp honey',
      'Salt to taste',
      'Fresh coriander',
    ],
    instructions:
      'Marinate chicken in yogurt and tandoori masala for 2 hours or overnight.\nGrill or pan-fry chicken until charred. Set aside and chop.\nSauté onion in butter until golden. Add garlic and ginger, cook 2 minutes.\nAdd spices and cook 1 minute. Add passata and simmer 20 minutes.\nBlend sauce until silky smooth. Return to pan.\nAdd cream, honey, and chicken. Simmer 10 minutes. Season to taste.\nFinish with a knob of cold butter stirred in off the heat. Garnish with coriander.',
    prepTimeMinutes: 20,
    cookTimeMinutes: 45,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'indian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXdSkvWpXpeEWD6IuhrLgX5QNYTUJ13lx42OFo',
  },
  {
    title: 'Caesar Salad',
    description:
      'The classic — crisp romaine, a punchy anchovy dressing, homemade croutons, and plenty of Parmesan. Made properly from scratch.',
    ingredients: [
      '2 heads romaine lettuce',
      '4 anchovy fillets',
      '2 garlic cloves',
      '1 egg yolk',
      '1 tbsp Dijon mustard',
      '2 tbsp lemon juice',
      '100ml olive oil',
      '50g Parmesan, grated',
      '2 slices sourdough bread',
      'Salt and black pepper',
    ],
    instructions:
      'Tear bread into chunks, toss with olive oil and salt. Bake at 200°C for 10 minutes until golden. Set aside.\nMash anchovies and garlic into a paste with the back of a knife.\nWhisk together anchovy paste, egg yolk, mustard, and lemon juice.\nSlowly drizzle in olive oil while whisking to emulsify into a thick dressing.\nFold in most of the Parmesan. Season generously with black pepper.\nTear romaine into large pieces. Toss with dressing until well coated.\nTop with croutons and remaining Parmesan. Serve immediately.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'american' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXfYhrSFR6nSpHJ8aX2dWDTLQRjUKNwur0qm4s',
  },
  {
    title: 'Pho Bo',
    description:
      'Vietnamese beef noodle soup with a deeply aromatic star anise and charred ginger broth. The broth is everything — it takes time but is worth every minute.',
    ingredients: [
      '1.5kg beef bones',
      '500g beef brisket',
      '2 onions, halved',
      '1 head garlic, halved',
      '5cm fresh ginger',
      '3 star anise',
      '1 cinnamon stick',
      '4 cloves',
      '1 tbsp fish sauce',
      '1 tsp sugar',
      'Rice noodles',
      'Bean sprouts',
      'Fresh Thai basil',
      'Lime wedges',
      'Sliced chillies',
      'Hoisin and sriracha to serve',
    ],
    instructions:
      'Char onions, garlic, and ginger directly over a gas flame or under the broiler until blackened on the outside.\nParboil beef bones in boiling water for 10 minutes. Drain and rinse.\nToast spices in a dry pan until fragrant.\nCombine bones, charred vegetables, spices, and brisket in a large pot. Cover with water and bring to a boil. Skim thoroughly.\nSimmer on low heat for 4–6 hours. Add fish sauce and sugar.\nRemove brisket when tender. Slice thinly.\nStrain broth. Adjust seasoning.\nSoak rice noodles according to packet. Divide into bowls.\nLadle hot broth over noodles. Top with brisket and fresh garnishes.',
    prepTimeMinutes: 30,
    cookTimeMinutes: 360,
    servings: 6,
    difficulty: 'hard' as const,
    cuisine: 'asian' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXeHRQmcYvz4Zb7KWxlqy2ni53cg8kYRPuDVsp',
  },
  {
    title: 'Enchiladas Verdes',
    description:
      'Corn tortillas filled with shredded chicken, rolled up and smothered in a bright, tangy tomatillo sauce, then baked with cheese.',
    ingredients: [
      '500g chicken thighs',
      '500g tomatillos, husked',
      '2 poblano chillies',
      '2 jalapeños',
      '1 white onion',
      '4 garlic cloves',
      'Small bunch coriander',
      '12 corn tortillas',
      '200g Monterey Jack or mozzarella, grated',
      '200ml sour cream',
      'Vegetable oil',
      'Salt',
    ],
    instructions:
      'Poach chicken in salted water with half the onion and garlic until cooked through, about 20 minutes. Shred.\nBlister tomatillos, poblanos, jalapeños, remaining onion, and garlic under the broiler until charred.\nBlend charred vegetables with coriander and salt into a smooth sauce.\nFry corn tortillas briefly in oil to soften. Drain on paper towels.\nFill each tortilla with chicken, roll tightly, and place seam-side down in a baking dish.\nPour tomatillo sauce generously over. Top with cheese.\nBake at 190°C for 20 minutes until cheese is bubbly. Serve with sour cream.',
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    servings: 4,
    difficulty: 'medium' as const,
    cuisine: 'mexican' as const,
    imageUrl:
      'https://pwcmvlpo9x.ufs.sh/f/lTSlxcQwH6EXuodx4mcO6Cs0emkziSXVpPTIUHBQ8a7MGFc2',
  },
];

// ── Run seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding database…');

  // Insert seed user
  await db.insert(users).values(SEED_USER).onConflictDoNothing();

  console.log(`  ✓ Seed user: ${SEED_USER.email}`);

  // Insert recipes
  const inserted = await db
    .insert(recipes)
    .values(
      SEED_RECIPES.map((r) => ({
        ...r,
        authorId: SEED_USER_ID,
      })),
    )
    .onConflictDoNothing()
    .returning({ title: recipes.title });

  console.log(`  ✓ Inserted ${inserted.length} recipes`);
  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
