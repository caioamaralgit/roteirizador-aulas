(() => {
    const { jsPDF } = window.jspdf;

    if (!jsPDF) {
        console.error("jsPDF is not loaded");
        return;
    }

    window.PdfGenerator = class PdfGenerator {
        constructor(mainMessage, scriptureExcerpts, conclusionResources) {
            this.mainMessage = mainMessage;
            this.scriptureExcerpts = scriptureExcerpts;
            this.conclusionResources = conclusionResources;

            this.defaultXPosition = 20;
            this.defaultYPosition = 20;

            this.maxLineWidth = 195;
            this.maxPageHeight = 280;

            this.lineHeight = 10;
            this.wordSpacing = 1.1;

            this.xPosition = 20;
            this.yPosition = 20;

            this.instance = new jsPDF();
            this.instance.setFont("OpenSans-Regular");
        }

        breakLine() {
            this.xPosition = this.defaultXPosition;
            this.yPosition += this.lineHeight;

            if (this.yPosition <= this.maxPageHeight) return;

            this.yPosition = this.defaultYPosition;

            this.instance.addPage([297, 210], "portrait");
            this.instance.setPage(this.instance.internal.getNumberOfPages());
        }

        writeText(text) {
            const words = (text || "")
                .toString()
                .split(" ")
                .map((word) => word.replace(/\t/g, ""));

            words.forEach((word) => {
                const hasLineBreak = word.includes("\n");

                if (hasLineBreak) {
                    const breakedWord = word.split("\n");

                    breakedWord.forEach((word, index) => {
                        this.writeText(word);
                        if (index < breakedWord.length - 1) this.breakLine();
                    });

                    return;
                }

                const lineWidthAfterWord =
                    this.xPosition +
                    this.wordSpacing +
                    this.instance.getTextWidth(word);

                const breakLine = lineWidthAfterWord > this.maxLineWidth;

                this.xPosition = breakLine
                    ? this.defaultXPosition
                    : this.xPosition + this.wordSpacing;

                if (breakLine) this.breakLine();

                this.instance.text(word, this.xPosition, this.yPosition);

                this.xPosition +=
                    this.wordSpacing + this.instance.getTextWidth(word);
            });
        }

        writeTitle() {
            this.instance.setFontSize(20);

            this.instance.text(
                "Vem e Segue-me",
                this.instance.internal.pageSize.getWidth() / 2,
                this.yPosition,
                { align: "center" }
            );

            this.instance.setFontSize(12);
        }

        export() {
            this.writeTitle();

            this.breakLine();
            this.breakLine();

            this.writeText("Mensagem principal:");

            this.breakLine();

            this.instance.setFont("OpenSans-Regular", "italic");

            this.writeText(`“${this.mainMessage}”`);

            this.instance.save(
                `aula-vem-e-segue-me-${new Date().getTime()}.pdf`
            );
        }
    };
})();
