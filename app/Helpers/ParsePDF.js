/* eslint-disable prettier/prettier */
const pdfjs = require('pdfjs-dist');

var customVar;
const historicoInfo = {};

class ParsePDF {
    async extractInformationFromPDF(pdfPath) {
        const pdf = await pdfjs.getDocument(pdfPath).promise;
        const pageTexts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = [];

            content.items.forEach((item) => {
                if ('str' in item) {
                    const text = item.str.trim();
                    pageText.push(text);
                }
            });

            pageTexts.push(pageText);
        }
        return pageTexts;
    }

    extractField(text, fieldName) {
        const regex = new RegExp(`${fieldName}:\\s*(.*)`, 'i');
        const match = text.match(regex);
        return match ? match[1] : null;
    }

    parseHistorico(historicoTexto) {
        const disciplinaPattern = /Disciplina: (.+)/;
        const codigoPattern = /Código: (.+)/;
        const situacaoPattern = /Situação: (.+)/;
        const anoPattern = /Ano: (.+)/;
        const professorPattern = /Professor: (.+)\(.+\)/;
        const mediaPattern = /Média: ([\d,]+)/;

        const disciplinas = [];
        const lines = historicoTexto.split('-----------------------\n');

        for (let i = 0; i < lines.length; i++) {
            const disciplinaMatch = lines[i].match(disciplinaPattern);
            if (disciplinaMatch) {
                const disciplina = {
                    nome: disciplinaMatch[1].trim(),
                };

                const codigoMatch = lines[i].match(codigoPattern);
                if (codigoMatch) {
                    disciplina.codigo = codigoMatch[1].trim();
                }

                const situacaoMatch = lines[i].match(situacaoPattern);
                if (situacaoMatch) {
                    disciplina.situacao = situacaoMatch[1].trim();
                }

                const anoMatch = lines[i].match(anoPattern);
                if (anoMatch) {
                    disciplina.ano = anoMatch[1].trim();
                }

                const professorMatch = lines[i].match(professorPattern);
                if (professorMatch) {
                    disciplina.professor = professorMatch[1].trim();
                }

                const mediaMatch = lines[i].match(mediaPattern);
                if (mediaMatch) {
                    disciplina.media = parseFloat(mediaMatch[1].replace(',', '.'));
                }
                disciplinas.push(disciplina);
            }
        }
        return disciplinas;
    }

    async map(paragraph, i) {
        const regex1 = /[0-9]{4}.[0-9]/g;
        const regex2 = /.*\([0-9]+h\)/g;
        const regex3 = /^[a-zA-Zá-úÁ-Úà-ùÀ-Ù ]{5,}$/g;
        const regex4 = /^[a-zA-Z]{2}[0-9]{3}|ENADE$/g;
        const regex5 = /^APR|APRN|CANC|DISP|MATRICULADO|MATR|REC|REP|REPF|REPMF|REPN|REPNF|TRANCADO|TRANC|TRANS|INCORP|CUMP|INCORP$/g;
        const regex6 = /^[0-9]{1,2},[0-9]{1}$/g;
        const regex7 = /^Componentes Curriculares Obrigat[oó]rios Pendentes:[0-9]+$/g;

        if (paragraph.match(regex1)) {
            customVar += '-----------------------\n';
            customVar += 'Ano: ' + paragraph + '\n';
        } else if (paragraph.match(regex5)) {
            customVar += 'Situação: ' + paragraph + '\n';
        } else if (paragraph.match(regex4)) {
            customVar += 'Código: ' + paragraph + '\n';
            i += 5;
        } else if (paragraph.match(regex3)) {
            customVar += 'Disciplina: ' + paragraph + '\n';
        } else if (paragraph.match(regex2)) {
            customVar += 'Professor: ' + paragraph + '\n';
        } else if (paragraph.match(regex6)) {
            customVar += 'Média: ' + paragraph + '\n';
        } else if (paragraph.match(regex7)) {
            return -1;
        }
        return i;
    }

    async extractCourseInformation(pageTexts) {
        var pages = 0;

        for (const pageText of pageTexts) {
            if (pages === 0) {
                historicoInfo.nome = pageText[7];
                historicoInfo.nacionalidade = pageText[13];
                historicoInfo.rg = pageText[17];
                historicoInfo.cpf = pageText[21];
                historicoInfo.dataNascimento = pageText[25];
                historicoInfo.prazoConclusao = pageText[34];
                historicoInfo.status = pageText[51];
                historicoInfo.ira = pageText[76];
                historicoInfo.anoLetivo = pageText[91];
                historicoInfo.matricula = pageText[103];

                var historico = pageText.slice(122, pageText.length - 9);
                for (var i = 0; i < historico.length; i++) {
                    i = await this.map(historico[i], i);
                    if (i === -1) {
                        historicoInfo.disciplinas = this.parseHistorico(customVar);
                        return historicoInfo;
                    }
                }
            } else {
                var historico = pageText.slice(34, pageText.length - 9);
                for (var i = 0; i < historico.length; i++) {
                    i = await this.map(historico[i], i);
                    if (i === -1) {
                        historicoInfo.disciplinas = this.parseHistorico(customVar);
                        return historicoInfo;
                    }
                }
            }
            pages++;
        }
        return;
    }

    async read(pdfPath) {
        customVar = '';
        try {
            const pageTexts = await this.extractInformationFromPDF(pdfPath);
            const info = await this.extractCourseInformation(pageTexts);
            return info;
        } catch (error) {
            console.error(error);
            return {};
        }
    }
}

module.exports = ParsePDF;