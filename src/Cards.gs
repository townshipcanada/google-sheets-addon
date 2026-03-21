/**
 * Township Canada Google Sheets Add-On - Card UI
 *
 * Google Workspace Add-on card interface (used in the sidebar card view).
 */

/**
 * Create the homepage card shown when the add-on is opened.
 */
function createHomepageCard() {
  var usage = apiGetUsage();

  var usageText;
  if (!usage.apiKeyValid) {
    usageText = "No API key connected";
  } else if (usage.plan === "trial") {
    usageText = usage.used + "/" + usage.limit + " trial calls (" + usage.daysLeft + " days left)";
  } else {
    usageText = "Unlimited (paid API key)";
  }

  var card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Township Canada")
        .setSubtitle("Legal Land Description Converter")
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Usage")
        .addWidget(
          CardService.newDecoratedText()
            .setText(usageText)
            .setTopLabel("API Usage")
        )
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Custom Functions")
        .addWidget(
          CardService.newDecoratedText()
            .setText('=TOWNSHIP("NW-25-24-1-W5")')
            .setTopLabel("Get lat/lng coordinates")
            .setWrapText(true)
        )
        .addWidget(
          CardService.newDecoratedText()
            .setText('=TOWNSHIP_LAT("LSD 10-33-045-04 W4")')
            .setTopLabel("Get latitude only")
            .setWrapText(true)
        )
        .addWidget(
          CardService.newDecoratedText()
            .setText('=TOWNSHIP_LNG("A-2-F/93-P-8")')
            .setTopLabel("Get longitude only")
            .setWrapText(true)
        )
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Batch Operations")
        .addWidget(
          CardService.newTextButton()
            .setText("Open Sidebar")
            .setOnClickAction(
              CardService.newAction().setFunctionName("openSidebarFromCard")
            )
        )
    );

  if (!usage.apiKeyValid) {
    card.addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextButton()
            .setText("Connect API Key")
            .setOnClickAction(
              CardService.newAction().setFunctionName("openSettingsFromCard")
            )
        )
    );
  }

  return card.build();
}

/**
 * Open the sidebar from the card UI.
 */
function openSidebarFromCard() {
  showSidebar();
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Sidebar opened"))
    .build();
}

/**
 * Open settings from the card UI.
 */
function openSettingsFromCard() {
  showSettingsDialog();
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Settings opened"))
    .build();
}
