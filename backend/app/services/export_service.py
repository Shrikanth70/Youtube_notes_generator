import os
from io import BytesIO
from typing import Tuple
from reportlab.lib.pagesizes import LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.colors import HexColor
import markdown2
import re


class ExportService:
    def generate_markdown(self, title: str, content: str) -> BytesIO:
        """
        Prepares a markdown file for download.
        """
        output = BytesIO()
        markdown_text = f"# {title}\n\n{content}"
        output.write(markdown_text.encode("utf-8"))
        output.seek(0)
        return output

    def generate_pdf(self, title: str, markdown_content: str) -> BytesIO:
        """
        Converts markdown content to a styled PDF.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=LETTER,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        styles = getSampleStyleSheet()
        
        # Custom Title Style
        title_style = ParagraphStyle(
            name='TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor("#6366f1"),  # Primary Indigo
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        # Custom Body Style
        body_style = ParagraphStyle(
            name='BodyStyle',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            spaceBefore=10,
            fontName='Helvetica'
        )

        # Custom Heading Style
        heading_style = ParagraphStyle(
            name='HeadingStyle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=HexColor("#1f2937"),
            spaceBefore=20,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )

        elements = []

        # Add Title
        elements.append(Paragraph(title, title_style))
        elements.append(Spacer(1, 12))

        # Convert Markdown to HTML for easier parsing or just clean up markdown
        # For simplicity, we'll do basic markdown parsing for headings and bullets
        lines = markdown_content.split('\n')
        for line in lines:
            if line.startswith('# '):
                # We already did the main title, treat other # as H2
                text = line[2:].strip()
                elements.append(Paragraph(text, heading_style))
            elif line.startswith('## '):
                text = line[3:].strip()
                elements.append(Paragraph(text, heading_style))
            elif line.startswith('### '):
                text = line[4:].strip()
                elements.append(Paragraph(text, heading_style))
            elif line.startswith('- ') or line.startswith('* '):
                text = line[2:].strip()
                # Simple bullet point
                elements.append(Paragraph(f"&bull; {text}", body_style))
            elif line.strip() == "":
                elements.append(Spacer(1, 10))
            else:
                # Regular text - remove some basic markdown markers
                text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
                text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
                elements.append(Paragraph(text, body_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer


export_service = ExportService()
