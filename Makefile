VERSION := $(shell sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' src/manifest.json)
ZIP_NAME := for-me-v$(VERSION).zip
SRC_DIR := src

.PHONY: package clean

package: $(ZIP_NAME)

$(ZIP_NAME):
	rm -f $(ZIP_NAME)
	cd $(SRC_DIR) && zip -r ../$(ZIP_NAME) .

clean:
	rm -f $(ZIP_NAME)
