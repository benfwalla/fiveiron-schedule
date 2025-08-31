import { Location } from '@/types/booking';

export const FIVE_IRON_LOCATIONS: Location[] = [
  // All locations in alphabetical order
  {
    id: '4388c520-a4de-4d49-b812-e2cb4badf667',
    name: 'FiDi',
    city: 'New York City'
  },
  {
    id: '31f9eb4b-7fa7-4073-9c36-132b626c8b7e',
    name: 'Flatiron',
    city: 'New York City'
  },
  {
    id: 'c71d765c-c7fd-4be7-aaba-2f3b21a91ba0',
    name: 'Grand Central',
    city: 'New York City'
  },
  {
    id: 'd88353cb-4ec3-4477-b9dc-177692591b30',
    name: 'Herald Square',
    city: 'New York City'
  },
  {
    id: 'e17214e1-28cb-4170-ab89-ea3532501251',
    name: 'Long Island City',
    city: 'New York City'
  },
  // {
  //   id: '610341f5-c98d-4e02-ba7f-0ce46348cd34',
  //   name: 'Rockefeller Center',
  //   city: 'New York City'
  // },
  {
    id: '3e7541f4-535a-42ad-b5d2-32bc46ce859e',
    name: 'Upper East Side',
    city: 'New York City'
  }
];

export const getLocationById = (id: string): Location | undefined => {
  return FIVE_IRON_LOCATIONS.find(location => location.id === id);
};

export const getDefaultLocation = (): Location => {
  return FIVE_IRON_LOCATIONS[3]; // Herald Square as default
};
