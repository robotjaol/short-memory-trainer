/**
 * Bundled offline word bank for Word Recall and Delayed Recall exercises.
 * Categorized and standardized for clear cognitive testing without obscure or ambiguous vocabulary.
 */

export const WORD_BANK = [
  'Anchor', 'Bridge', 'Castle', 'Dolphin', 'Eagle', 'Forest', 'Garden', 'Harbor',
  'Island', 'Jungle', 'Kettle', 'Lantern', 'Mountain', 'Needle', 'Orbit', 'Pillar',
  'Quiver', 'River', 'Shield', 'Tunnel', 'Umbrella', 'Valley', 'Window', 'Beacon',
  'Canyon', 'Desert', 'Falcon', 'Glacier', 'Horizon', 'Icicle', 'Knight', 'Lagoon',
  'Meadow', 'Nest', 'Oasis', 'Planet', 'Quartz', 'Ribbon', 'Summit', 'Timber',
  'Vessel', 'Willow', 'Zephyr', 'Breeze', 'Compass', 'Drift', 'Echo', 'Flint',
  'Grove', 'Haven', 'Ingot', 'Journey', 'Kite', 'Loom', 'Mirage', 'Nexus',
  'Orchard', 'Pebble', 'Relic', 'Stream', 'Thicket', 'Urn', 'Voyage', 'Weave',
  'Blossom', 'Cabin', 'Dewdrop', 'Ember', 'Frost', 'Glimmer', 'Hearth', 'Ivory',
  'Jasper', 'Kindle', 'Lichen', 'Monolith', 'Nomad', 'Opal', 'Pinnacle', 'Riddle',
  'Shadow', 'Trophy', 'Vault', 'Wharf', 'Amber', 'Bough', 'Chisel', 'Delta',
  'Acorn', 'Badger', 'Basin', 'Bison', 'Boulder', 'Branch', 'Canyon', 'Cedar',
  'Clover', 'Comet', 'Corridor', 'Cottage', 'Crater', 'Crystal', 'Current', 'Cypress',
  'Dahlia', 'Dawn', 'Den', 'Dune', 'Easel', 'Elm', 'Falcon', 'Fern',
  'Fjord', 'Forge', 'Fossil', 'Gale', 'Geode', 'Gorge', 'Granite', 'Harvester',
  'Hawk', 'Hazel', 'Heron', 'Hilltop', 'Iris', 'Ivy', 'Kestrel', 'Lagoon',
  'Ledge', 'Leopard', 'Lotus', 'Magpie', 'Maple', 'Marble', 'Mast', 'Meteor',
  'Moonbeam', 'Moss', 'Nectar', 'Nutmeg', 'Onyx', 'Orchid', 'Otter', 'Panda',
  'Pelican', 'Petal', 'Pebble', 'Pine', 'Plaza', 'Porch', 'Quarry', 'Raven',
  'Reef', 'Ripples', 'Robin', 'Rowan', 'Sable', 'Saffron', 'Salad', 'Sandstone',
  'Sapphire', 'Seagull', 'Seashell', 'Silver', 'Siren', 'Slate', 'Sparrow', 'Spindle',
  'Starfish', 'Stork', 'Sunrise', 'Talon', 'Terrace', 'Thistle', 'Tide', 'Tiger',
  'Topaz', 'Torch', 'Trail', 'Trellis', 'Tulip', 'Tundra', 'Valley', 'Vineyard',
  'Walnut', 'Waterfall', 'Waves', 'Whale', 'Wheat', 'Whisper', 'Wildflower', 'Willow',
  'Wombat', 'Wren', 'Yarrow', 'Yucca', 'Zebra', 'Albatross', 'Antler', 'Atlas',
  'Avalanche', 'Bamboo', 'Banyan', 'Bark', 'Basalt', 'Bayou', 'Bramble', 'Brook',
  'Cactus', 'Calcite', 'Canopy', 'Cascade', 'Cavern', 'Chalice', 'Cliff', 'Coastline',
  'Cobblestone', 'Conch', 'Constellation', 'Coral', 'Creek', 'Crest', 'Dawn', 'Estuary',
  'Evergreen', 'Feather', 'Firefly', 'Fountain', 'Galaxy', 'Garnet', 'Geyser', 'Grotto',
  'Glade', 'Highland', 'Iceberg', 'Juniper', 'Keel', 'Labradorite', 'Lake', 'Limestone',
  'Lighthouse', 'Meadowlark', 'Mineral', 'Moonstone', 'Moraine', 'Nautilus', 'Nebula', 'Obsidian',
  'Ocean', 'Outcrop', 'Overlook', 'Peak', 'Peninsula', 'Perch', 'Pond', 'Prism',
  'Promontory', 'Rainforest', 'Rapids', 'Ravine', 'Ridge', 'Riverbed', 'Rivulet', 'Roost',
  'Saltmarsh', 'Savanna', 'Scarp', 'Seashore', 'Shoal', 'Sierra', 'Solstice', 'Spring',
  'Stalactite', 'Star', 'Steppe', 'Strait', 'Strata', 'Streamlet', 'Swale', 'Tidepool'
];

/**
 * Returns a randomized subset of words
 */
export function getRandomWords(count: number, exclude: string[] = []): string[] {
  const available = WORD_BANK.filter(w => !exclude.map(x => x.toLowerCase()).includes(w.toLowerCase()));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Normalizes user word input for matching (trim, lowercase, punctuation removed)
 */
export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}
