import os
import json
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Custom canvas to draw page numbers and running header/footer
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Suppress headers and footers on the cover page (Page 1)
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(54, 750, "PredictIQ Studio – AutoML Business Analytics Report")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

            # Footer
            self.setFont("Helvetica", 8)
            self.drawString(54, 36, "Confidential – Internal Business Use Only")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(612 - 54, 36, page_text)
            self.line(54, 48, 612 - 54, 48)

        self.restoreState()


def build_pdf_report(
    output_path: str,
    company_name: str,
    report_title: str,
    dataset_info: Dict[str, Any],
    cleaning_info: List[str],
    leaderboard: List[Dict[str, Any]],
    best_model_info: Dict[str, Any],
    insights_info: Dict[str, Any]
):
    # Setup document geometry
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    # Define custom corporate color palette
    primary_color = colors.HexColor("#2563EB")   # Sleek Blue
    secondary_color = colors.HexColor("#0F172A") # Slate 900
    body_color = colors.HexColor("#334155")      # Slate 700
    border_color = colors.HexColor("#E2E8F0")    # Slate 200

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=secondary_color,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=16,
        leading=22,
        textColor=primary_color,
        spaceAfter=30
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=body_color
    )

    h1_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=secondary_color,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SubSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=body_color,
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=body_color,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeaderCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=body_color
    )

    story = []

    # --- COVER PAGE ---
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph(report_title, title_style))
    story.append(Paragraph(f"AutoML Analysis & Business Insights Report", subtitle_style))
    story.append(Spacer(1, 0.5 * inch))
    
    # Simple accent bar on cover page
    accent_data = [[""]]
    accent_table = Table(accent_data, colWidths=[500], rowHeights=[4])
    accent_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('PADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(accent_table)
    story.append(Spacer(1, 1.5 * inch))

    # Meta details
    story.append(Paragraph(f"<b>Prepared For:</b> {company_name}", meta_style))
    story.append(Paragraph(f"<b>Generated On:</b> {datetime.now().strftime('%B %d, %Y')}", meta_style))
    story.append(Paragraph(f"<b>Platform:</b> PredictIQ Studio AutoML Engine", meta_style))
    story.append(PageBreak())

    # --- SECTION 1: DATASET PROFILE ---
    story.append(Paragraph("1. Dataset Profile & Summary", h1_style))
    story.append(Paragraph(
        f"The AutoML engine parsed the dataset <b>{dataset_info.get('name', 'N/A')}</b>. "
        "Below is an overview of the dataset dimensions and data quality metrics.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Info Grid table
    info_data = [
        [Paragraph("<b>Metric</b>", table_header_style), Paragraph("<b>Value</b>", table_header_style)],
        [Paragraph("Dataset Name", table_body_style), Paragraph(str(dataset_info.get('name', 'N/A')), table_body_style)],
        [Paragraph("Total Row Count", table_body_style), Paragraph(f"{dataset_info.get('row_count', 0):,}", table_body_style)],
        [Paragraph("Total Column Count", table_body_style), Paragraph(str(dataset_info.get('col_count', 0)), table_body_style)],
        [Paragraph("File Size", table_body_style), Paragraph(f"{(dataset_info.get('size_bytes', 0) / 1024):.1f} KB", table_body_style)],
        [Paragraph("Data Quality Score", table_body_style), Paragraph(f"<b>{dataset_info.get('data_quality_score', 0)}/100</b>", table_body_style)]
    ]
    info_table = Table(info_data, colWidths=[200, 300])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # --- SECTION 2: DATA CLEANING ---
    story.append(Paragraph("2. Applied Data Cleaning Steps", h1_style))
    if cleaning_info:
        story.append(Paragraph("The following data cleansing and preprocessing pipeline steps were executed prior to training:", body_style))
        for step in cleaning_info:
            story.append(Paragraph(f"• {step}", bullet_style))
    else:
        story.append(Paragraph("No custom cleaning operations were applied. The raw dataset was preprocessed automatically inside the AutoML training pipeline.", body_style))
    story.append(Spacer(1, 20))

    # --- SECTION 3: AUTOML LEADERBOARD ---
    story.append(Paragraph("3. AutoML Model Comparison", h1_style))
    story.append(Paragraph(
        "A total split validation was run on multiple algorithms. The leaderboard below displays performance metrics. "
        "Algorithms are ranked based on their validation score.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Determine columns based on task type
    task_type = best_model_info.get("task_type", "classification")
    if task_type == "classification":
        headers = ["Model", "Accuracy", "Precision", "Recall", "F1 Score", "CV Score", "Time"]
        keys = ["model_name", "accuracy", "precision", "recall", "f1", "cv_score", "training_time"]
    else:
        headers = ["Model", "R² Score", "MAE", "RMSE", "CV Score", "Time"]
        keys = ["model_name", "r2", "mae", "rmse", "cv_score", "training_time"]

    header_row = [Paragraph(f"<b>{h}</b>", table_header_style) for h in headers]
    leaderboard_data = [header_row]

    for model in leaderboard:
        row = []
        for key in keys:
            val = model.get(key, 0.0)
            if key == "model_name":
                row.append(Paragraph(f"<b>{val}</b>", table_body_style))
            elif key == "training_time":
                row.append(Paragraph(f"{val:.3f}s", table_body_style))
            elif key in ["accuracy", "precision", "recall", "f1", "r2", "cv_score"]:
                row.append(Paragraph(f"{val * 100:.2f}%" if val <= 1.0 else f"{val:.4f}", table_body_style))
            else:
                row.append(Paragraph(f"{val:.4f}", table_body_style))
        leaderboard_data.append(row)

    # Compute column widths
    col_width = 500 / len(headers)
    col_widths = [col_width * 1.5 if i == 0 else col_width * 0.9 for i in range(len(headers))]

    leaderboard_table = Table(leaderboard_data, colWidths=col_widths)
    leaderboard_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(leaderboard_table)
    story.append(Spacer(1, 25))

    # --- SECTION 4: BEST MODEL DETAILS ---
    story.append(Paragraph("4. Best Model Deep-Dive", h1_style))
    story.append(Paragraph(
        f"The best performing model is <b>{best_model_info.get('best_model_name', 'N/A')}</b>. "
        f"It was selected automatically based on optimization targets for '{best_model_info.get('target_column', 'N/A')}'.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # --- SECTION 5: AI BUSINESS INSIGHTS ---
    story.append(PageBreak())
    story.append(Paragraph("5. AI Business Insights & Recommendations", h1_style))
    story.append(Paragraph("This section outlines tactical business findings derived from model metrics, weights, and feature importance.", body_style))
    story.append(Spacer(1, 10))

    # Executive Summary
    story.append(Paragraph("Executive Summary", h2_style))
    story.append(Paragraph(insights_info.get("executive_summary", "N/A"), body_style))
    story.append(Spacer(1, 10))

    # Data Quality Review
    story.append(Paragraph("Data Quality Review", h2_style))
    story.append(Paragraph(insights_info.get("data_quality_review", "N/A"), body_style))
    story.append(Spacer(1, 10))

    # Feature Importance Summary
    story.append(Paragraph("Primary Business Drivers (Feature Importance)", h2_style))
    story.append(Paragraph(insights_info.get("feature_importance_summary", "N/A"), body_style))
    story.append(Spacer(1, 10))

    # Recommendations List
    story.append(Paragraph("Actionable Recommendations", h2_style))
    recs = insights_info.get("business_recommendations", [])
    if isinstance(recs, list):
        for rec in recs:
            story.append(Paragraph(f"• {rec}", bullet_style))
    else:
        story.append(Paragraph(str(recs), body_style))
    story.append(Spacer(1, 15))

    # SWOT details in Table format
    swot_data = [
        [Paragraph("<b>Model Strengths</b>", table_header_style), Paragraph("<b>Model Weaknesses</b>", table_header_style)],
        [
            Paragraph("<br/>".join([f"• {s}" for s in insights_info.get("strengths", [])]), table_body_style),
            Paragraph("<br/>".join([f"• {w}" for w in insights_info.get("weaknesses", [])]), table_body_style)
        ],
        [Paragraph("<b>Possible Bias & Risks</b>", table_header_style), Paragraph("<b>Suggestions for Improvement</b>", table_header_style)],
        [
            Paragraph("<br/>".join([f"• {b}" for b in insights_info.get("possible_bias", [])]), table_body_style),
            Paragraph("<br/>".join([f"• {s}" for s in insights_info.get("improvement_suggestions", [])]), table_body_style)
        ]
    ]

    swot_table = Table(swot_data, colWidths=[250, 250])
    swot_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BACKGROUND', (0,2), (-1,2), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
    ]))
    story.append(swot_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
