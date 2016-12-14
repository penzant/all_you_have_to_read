## How to use
* Set your google spreadsheet url (json format) as `targetpath` variable (I define this in `readfile.js`, for example)
* Your google spreadsheet consists of the following five columns:
  1. paper title
  2. paper url
  3. memorandum
  4. tags (comma-separated string)
  5. year
* A url example google spreadsheet (json)
  - `https://spreadsheets.google.com/feeds/cells/(shpreadsheet id)/1/public/values?alt=json`
* Make sure that your google spreadsheet is permitted to be accessed via url link.