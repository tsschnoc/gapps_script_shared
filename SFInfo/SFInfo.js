var matches = google.contentmatch.getContentMatches();
var matchList = document.createElement('UL');
var listItem;
var extractedText;
for (var match in matches) {
  for (var key in matches[match]) {
    listItem = document.createElement('LI');
    extractedText = document.createTextNode(key + ": " + matches[match][key]);
    listItem.appendChild(extractedText);
    matchList.appendChild(listItem);
  }
}
document.body.appendChild(matchList);
gadgets.window.adjustHeight(300);