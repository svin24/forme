VERSION := $(shell sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' src/manifest.json)
ZIP_NAME := for-me-v$(VERSION).zip
XPI_NAME := for-me-v$(VERSION).xpi
CRX_NAME := for-me-v$(VERSION).crx
CRX_KEY := chrome-extension.pem
CRX_TOOL := $(shell command -v chromium 2>/dev/null || command -v chromium-browser 2>/dev/null || command -v google-chrome 2>/dev/null || command -v google-chrome-stable 2>/dev/null)
SRC_DIR := src

.PHONY: zip xpi crx clean

zip: $(ZIP_NAME)

$(ZIP_NAME):
	rm -f $(ZIP_NAME)
	cd $(SRC_DIR) && zip -r ../$(ZIP_NAME) .

xpi: $(XPI_NAME)

$(XPI_NAME):
	rm -f $(XPI_NAME)
	cd $(SRC_DIR) && zip -r ../$(XPI_NAME) .

crx: $(CRX_NAME)

$(CRX_NAME):
	@if [ -z "$(CRX_TOOL)" ]; then echo "No Chromium/Chrome binary found (chromium, chromium-browser, google-chrome)."; exit 1; fi
	@if [ ! -f "$(CRX_KEY)" ]; then echo "Generating $(CRX_KEY)"; openssl genrsa -out $(CRX_KEY) 2048; fi
	rm -f $(CRX_NAME) $(SRC_DIR).crx
	"$(CRX_TOOL)" --pack-extension=$(SRC_DIR) --pack-extension-key=$(CRX_KEY)
	@if [ ! -f "$(SRC_DIR).crx" ]; then echo "Failed to create $(SRC_DIR).crx"; exit 1; fi
	mv $(SRC_DIR).crx $(CRX_NAME)

clean:
	rm -f for-me-v*.zip for-me-v*.xpi for-me-v*.crx $(CRX_KEY)
