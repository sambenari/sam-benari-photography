/*
  ============================================================
  PROJECTS CONFIGURATION
  ============================================================
  
  HOW TO ADD A NEW PROJECT:
  
  1. Create a folder inside /projects/ named after your project
     e.g.  projects/new-york-2024/
  
  2. Inside the folder, add:
     - cover.jpg   (the cover image shown on the home page)
     - Any number of photos (jpg, jpeg, png, webp)
  
  3. Add an entry to the PROJECTS array below:
     {
       folder: "new-york-2024",         <- folder name (must match exactly)
       title:  "New York 2024",          <- display name
       photos: [                         <- list all photos in this project
         "img_001.jpg",
         "img_002.jpg",
         ...
       ]
     }
  
  4. Save this file. Reload the website. Done.
  
  ============================================================
  ORDERING: Projects appear in the order listed below.
  Put your newest project first.
  ============================================================
*/

const PROJECTS = [

    {
    folder: "Through The Window",
    title:  "Through The Window",
    description: "A study of intimate moments framed by windows and reflections across the city.",
    photos: [
"Imag 1.jpg",
"Imag 2.jpg",      
"Imag 3.jpg",
"Imag 4.jpg",
"Imag 5.jpg",
"Imag 6.jpg",
"Imag 7.jpg",
"Imag 8.jpg",
"Imag 9.jpg",
"Imag 10.jpg",
"Imag 11.jpg",
"Imag 12.jpg",
"Imag 13.jpg",
"Imag 14.jpg",
"Imag 15.jpg",
"Imag 16.jpg",
"Imag 17.jpg",
"Imag 18.jpg",
"Imag 19.jpg",
"Imag 20.jpg",
"Imag 21.jpg",
"Imag 22.jpg",
"Imag 23.jpg",
"Imag 24.jpg",
"Imag 25.jpg",
"Imag 26.jpg",
"Imag 27.jpg",
"Imag 28.jpg",
"Imag 29.jpg",
"Imag 30.jpg",
    ]
  },

  {
    folder: "CafeLife",
    title:  "CafeLife",
    description: "Candid moments of urban life in cafés—conversations, solitude, ritual.",
    photos: [
"Imag.jpg",
"Imag 1.jpg",
"Imag 2.jpg",      
"Imag 3.jpg",
"Imag 4.jpg",
"Imag 5.jpg",
"Imag 6.jpg",
"Imag 7.jpg",
"Imag 8.jpg",
"Imag 9.jpg",
"Imag 10.jpg",
"Imag 11.jpg",
"Imag 12.jpg",
"Imag 13.jpg",
"Imag 14.jpg",
"Imag 15.jpg",
"Imag 16.jpg",
"Imag 17.jpg",
"Imag 18.jpg",
"Imag 19.jpg",
"Imag 20.jpg",
"Imag 21.jpg",
"Imag 22.jpg",
"Imag 23.jpg",
"Imag 24.jpg",
"Imag 25.jpg",
"Imag 26.jpg",
"Imag 27.jpg",
"Imag 28.jpg",
"Imag 29.jpg",
"Imag 30.jpg",
"Imag 31.jpg",
"Imag 32.jpg",
"Imag 33.jpg",
"Imag 34.jpg",
"Imag 35.jpg",
"Imag 36.jpg",
"Imag 37.jpg",
"Imag 38.jpg",
"Imag 39.jpg",
"Imag 40.jpg",
"Imag 41.jpg",
"Imag 42.jpg",
"Imag 43.jpg",
"Imag 44.jpg",
"Imag 45.jpg",
"Imag 46.jpg",
"Imag 47.jpg",
"Imag 48.jpg",
"Imag 49.jpg",
"Imag 50.jpg",
"Imag 51.jpg",
"Imag 52.jpg",
"Imag 53.jpg",
"Imag 54.jpg",
    ]
  },
  {
    folder: "Soho",
    title:  "Soho",
    description: "The energy of one of London's most vibrant neighbourhoods—texture, character, collision.",
    photos: [
   "Imag 1.jpg",
"Imag 2.jpg",      
"Imag 3.jpg",
"Imag 4.jpg",
"Imag 5.jpg",
"Imag 6.jpg",
"Imag 7.jpg",
"Imag 8.jpg",
"Imag 9.jpg",
"Imag 10.jpg",
"Imag 11.jpg",
"Imag 12.jpg",
"Imag 13.jpg",
"Imag 14.jpg",
"Imag 15.jpg",
"Imag 16.jpg",
"Imag 17.jpg",
"Imag 18.jpg",
"Imag 19.jpg",
"Imag 20.jpg",
"Imag 21.jpg",
"Imag 22.jpg",
"Imag 23.jpg",
"Imag 24.jpg",
"Imag 25.jpg",
"Imag 26.jpg",
"Imag 27.jpg",
"Imag 28.jpg",
"Imag 29.jpg",
"Imag 30.jpg",
"Imag 31.jpg",
"Imag 32.jpg",
"Imag 33.jpg",
"Imag 34.jpg",
"Imag 35.jpg",
"Imag 36.jpg",
"Imag 37.jpg",
"Imag 38.jpg",
"Imag 39.jpg",
"Imag 40.jpg",
"Imag 41.jpg",
"Imag 42.jpg",
"Imag 43.jpg",
"Imag 44.jpg",
"Imag 45.jpg",
"Imag 46.jpg",
"Imag 47.jpg",
"Imag 48.jpg",
"Imag 49.jpg",
    ]

   },
 {
    folder: "Other Work",
    title:  "Other Work",
    description: "A collection of street moments from across the city—fragments of daily life.",
    photos: [
   "Imag 1.jpg",
"Imag 2.jpg",      
"Imag 3.jpg",
"Imag 4.jpg",
"Imag 5.jpg",
"Imag 6.jpg",
"Imag 7.jpg",
"Imag 8.jpg",
"Imag 9.jpg",
"Imag 10.jpg",
"Imag 11.jpg",
"Imag 12.jpg",
"Imag 13.jpg",
"Imag 14.jpg",
"Imag 15.jpg",
"Imag 16.jpg",
"Imag 17.jpg",
"Imag 18.jpg",
"Imag 19.jpg",
"Imag 20.jpg",
"Imag 21.jpg",
"Imag 22.jpg",
"Imag 23.jpg",
"Imag 24.jpg",
"Imag 25.jpg",
"Imag 26.jpg",
"Imag 27.jpg",
"Imag 28.jpg",
"Imag 29.jpg",
"Imag 30.jpg",
"Imag 31.jpg",

    ]

   },
];
