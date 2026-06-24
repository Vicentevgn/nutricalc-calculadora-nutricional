import { jsPDF } from "jspdf";

interface NutritionData {
    calories: number;
    carbohydrates: number;
    proteins: number;
    totalFats: number;
    saturatedFats: number;
    totalSugars: number;
    addedSugars: number;
    fiber: number;
    sodium: number;
}

interface DailyValues {
    calories: number;
    carbohydrates: number;
    addedSugars: number;
    proteins: number;
    totalFats: number;
    saturatedFats: number;
    fiber: number;
    sodium: number;
}

interface GeneratePdfParams {
    recipeName: string;
    servings: number;
    weightPerServing: string;
    nutritionPer100g: NutritionData;
    nutritionPerServing: NutritionData;
    dailyValues: DailyValues;
    frontLabelWarnings: string[];
}

export function generateNutritionPdf(params: GeneratePdfParams) {
    const {
        recipeName,
        servings,
        weightPerServing,
        nutritionPer100g,
        nutritionPerServing,
        dailyValues,
        frontLabelWarnings,
    } = params;

    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const marginX = 20;
    let y = 20;

    // Título da receita
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(recipeName, marginX, y);
    y += 10;

    // Caixa da tabela ANVISA
    const boxWidth = 90;
    const boxX = marginX;
    doc.setLineWidth(0.6);
    doc.rect(boxX, y, boxWidth, 100); // moldura externa, altura ajustada depois se precisar

    let cy = y + 6;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMAÇÃO NUTRICIONAL", boxX + boxWidth / 2, cy, { align: "center" });
    cy += 3;
    doc.setLineWidth(0.8);
    doc.line(boxX, cy, boxX + boxWidth, cy);
    cy += 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Porções por embalagem: ${servings}`, boxX + 2, cy);
    cy += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Porção: ${weightPerServing} g (1 porção)`, boxX + 2, cy);
    cy += 2;
    doc.setLineWidth(0.8);
    doc.line(boxX, cy, boxX + boxWidth, cy);
    cy += 4;

    // Cabeçalho colunas
    const col1X = boxX + 2;
    const col2X = boxX + boxWidth - 38;
    const col3X = boxX + boxWidth - 22;
    const col4X = boxX + boxWidth - 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("100 g", col2X, cy, { align: "right" });
    doc.text(`${weightPerServing} g`, col3X, cy, { align: "right" });
    doc.text("%VD*", col4X, cy, { align: "right" });
    cy += 1.5;
    doc.setLineWidth(0.3);
    doc.line(boxX, cy, boxX + boxWidth, cy);
    cy += 3;

    type Row = { label: string; per100: string; perServ: string; vd: string; indent?: number };

    const rows: Row[] = [
        {
            label: "Valor energético (kcal)",
            per100: nutritionPer100g.calories.toFixed(0),
            perServ: nutritionPerServing.calories.toFixed(0),
            vd: dailyValues.calories.toFixed(0),
        },
        {
            label: "Carboidratos (g)",
            per100: nutritionPer100g.carbohydrates.toFixed(1),
            perServ: nutritionPerServing.carbohydrates.toFixed(1),
            vd: dailyValues.carbohydrates.toFixed(0),
        },
        {
            label: "Açúcares totais (g)",
            per100: nutritionPer100g.totalSugars.toFixed(1),
            perServ: nutritionPerServing.totalSugars.toFixed(1),
            vd: "",
            indent: 2,
        },
        {
            label: "Açúcares adicionados (g)",
            per100: nutritionPer100g.addedSugars.toFixed(1),
            perServ: nutritionPerServing.addedSugars.toFixed(1),
            vd: dailyValues.addedSugars.toFixed(0),
            indent: 4,
        },
        {
            label: "Proteínas (g)",
            per100: nutritionPer100g.proteins.toFixed(1),
            perServ: nutritionPerServing.proteins.toFixed(1),
            vd: dailyValues.proteins.toFixed(0),
        },
        {
            label: "Gorduras totais (g)",
            per100: nutritionPer100g.totalFats.toFixed(1),
            perServ: nutritionPerServing.totalFats.toFixed(1),
            vd: dailyValues.totalFats.toFixed(0),
        },
        {
            label: "Gorduras saturadas (g)",
            per100: nutritionPer100g.saturatedFats.toFixed(1),
            perServ: nutritionPerServing.saturatedFats.toFixed(1),
            vd: dailyValues.saturatedFats.toFixed(0),
            indent: 2,
        },
        { label: "Gorduras trans (g)", per100: "0", perServ: "0", vd: "0", indent: 2 },
        {
            label: "Fibra alimentar (g)",
            per100: nutritionPer100g.fiber.toFixed(1),
            perServ: nutritionPerServing.fiber.toFixed(1),
            vd: dailyValues.fiber.toFixed(0),
        },
        {
            label: "Sódio (mg)",
            per100: nutritionPer100g.sodium.toFixed(0),
            perServ: nutritionPerServing.sodium.toFixed(0),
            vd: dailyValues.sodium.toFixed(0),
        },
    ];

    doc.setFontSize(7.5);
    for (const row of rows) {
        doc.setLineWidth(0.2);
        doc.line(boxX, cy - 2.6, boxX + boxWidth, cy - 2.6);

        doc.setFont("helvetica", "normal");
        doc.text(row.label, col1X + (row.indent ?? 0), cy);

        doc.text(row.per100, col2X, cy, { align: "right" });
        doc.text(row.perServ, col3X, cy, { align: "right" });
        doc.text(row.vd, col4X, cy, { align: "right" });

        cy += 4;
    }

    doc.setLineWidth(0.3);
    doc.line(boxX, cy - 2.6, boxX + boxWidth, cy - 2.6);
    cy += 2;

    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(
        "*Percentual de valores diários fornecidos pela porção.",
        boxX + 1,
        cy,
        { maxWidth: boxWidth - 2 }
    );

    const finalHeight = cy - y + 3;
    doc.setLineWidth(0.6);
    doc.rect(boxX, y, boxWidth, finalHeight);

    if (frontLabelWarnings.length > 0) {
        let stampY = y;
        const stampX = boxX + boxWidth + 12;
        const stampSize = 26;

        for (const warning of frontLabelWarnings) {
            drawWarningStamp(doc, stampX, stampY, stampSize, warning);
            stampY += stampSize + 8;
        }
    }

    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
}

function drawWarningStamp(doc: jsPDF, x: number, y: number, size: number, text: string) {
    doc.setFillColor(0, 0, 0);
    doc.triangle(
        x + size / 2, y,
        x, y + size,
        x + size, y + size,
        "F"
    );

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    const circleX = x + size / 2 - 1.5;
    const circleY = y + size * 0.62;
    doc.circle(circleX, circleY, size * 0.13, "S");
    doc.line(
        circleX + size * 0.09, circleY + size * 0.09,
        circleX + size * 0.18, circleY + size * 0.18
    );

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(text, x + size / 2, y + size + 5, {
        align: "center",
        maxWidth: size + 10,
    });
    doc.setTextColor(0, 0, 0);
}