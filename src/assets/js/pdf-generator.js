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

            this.maxLineWidth = 190;
            this.maxPageHeight = 280;

            this.lineHeight = 10;
            this.wordSpacing = 1.1;

            this.xPosition = 20;
            this.yPosition = 20;

            this.instance = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [297, 210],
            });

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

        writeExcerpt(excerpt) {
            this.instance.setFont("OpenSans-Light", "normal");

            this.writeText("Passagem:");

            this.instance.setFont("OpenSans-Light", "italic");

            this.writeText(excerpt.scripture);

            this.breakLine();

            this.instance.setFont("OpenSans-Light", "normal");

            this.writeText("Pergunta sobre o princípio:");

            this.instance.setFont("OpenSans-Light", "italic");

            this.writeText(excerpt.question);
        }

        writeFooterData() {
            this.instance.setFont("OpenSans-Regular", "normal");
            this.instance.setFontSize(8);

            const totalPages = this.instance.internal.getNumberOfPages();
            const date = new Date();

            const now = `${date.getDate().toString().padStart(2, "0")}/${(
                date.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}/${date.getFullYear()} ${(date.getHours() - 3)
                .toString()
                .padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${date
                .getSeconds()
                .toString()
                .padStart(2, "0")}`;

            for (let page = 1; page <= totalPages; page++) {
                this.instance.setPage(page);

                this.instance.text(
                    `Gerado em ${now}`,
                    this.defaultXPosition,
                    290
                );

                this.instance.text(
                    `Página ${
                        this.instance.internal.getCurrentPageInfo().pageNumber
                    } de ${totalPages}`,
                    170,
                    290
                );
            }
        }

        addLineSeparator() {
            this.breakLine();
            this.breakLine();

            this.instance.line(
                this.defaultXPosition,
                this.yPosition,
                this.maxLineWidth,
                this.yPosition
            );

            this.breakLine();
            this.breakLine();
        }

        export() {
            this.writeTitle();

            this.breakLine();
            this.breakLine();

            if (this.mainMessage) {
                this.writeText("Mensagem principal:");

                this.breakLine();

                this.instance.setFont("OpenSans-Regular", "italic");

                this.writeText(`“${this.mainMessage}”`);

                this.instance.setFont("OpenSans-Regular", "normal");

                this.addLineSeparator();
            }

            this.writeText("Escrituras selecionadas:");

            this.breakLine();

            this.scriptureExcerpts.forEach((excerpt, index) => {
                this.writeExcerpt(excerpt);
                if (index < this.scriptureExcerpts.length - 1) this.breakLine();
            });

            this.instance.setFont("OpenSans-Regular", "normal");

            if (this.conclusionResources) {
                this.addLineSeparator();

                this.writeText("Recursos para finalização:");

                this.breakLine();

                this.instance.setFont("OpenSans-Regular", "italic");

                this.writeText(this.conclusionResources);
            }

            this.writeFooterData();

            this.instance.save(
                `aula-vem-e-segue-me-${new Date().getTime()}.pdf`
            );
        }
    };
})();
