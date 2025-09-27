import { NextRequest } from 'next/server';
import { deflateRawSync } from 'node:zlib';
import { QueryResult, DnDModel, ReportPurpose } from '@/types/report';

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (buffer: Buffer): number => {
  let crc = 0 ^ -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

interface ZipEntry {
  name: string;
  data: Buffer;
}

const createZip = (entries: ZipEntry[]): Buffer => {
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const compressed = deflateRawSync(entry.data);
    const crc = crc32(entry.data);

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    let pointer = 0;
    localHeader.writeUInt32LE(0x04034b50, pointer); // signature
    pointer += 4;
    localHeader.writeUInt16LE(20, pointer); // version needed
    pointer += 2;
    localHeader.writeUInt16LE(0, pointer); // flags
    pointer += 2;
    localHeader.writeUInt16LE(8, pointer); // compression
    pointer += 2;
    localHeader.writeUInt16LE(0, pointer); // mod time
    pointer += 2;
    localHeader.writeUInt16LE(0, pointer); // mod date
    pointer += 2;
    localHeader.writeUInt32LE(crc, pointer);
    pointer += 4;
    localHeader.writeUInt32LE(compressed.length, pointer);
    pointer += 4;
    localHeader.writeUInt32LE(entry.data.length, pointer);
    pointer += 4;
    localHeader.writeUInt16LE(nameBuffer.length, pointer);
    pointer += 2;
    localHeader.writeUInt16LE(0, pointer); // extra length
    pointer += 2;
    nameBuffer.copy(localHeader, pointer);

    const localSegment = Buffer.concat([localHeader, compressed]);
    locals.push(localSegment);

    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    pointer = 0;
    centralHeader.writeUInt32LE(0x02014b50, pointer);
    pointer += 4;
    centralHeader.writeUInt16LE(0x0314, pointer); // version made by
    pointer += 2;
    centralHeader.writeUInt16LE(20, pointer); // version needed
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(8, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt32LE(crc, pointer);
    pointer += 4;
    centralHeader.writeUInt32LE(compressed.length, pointer);
    pointer += 4;
    centralHeader.writeUInt32LE(entry.data.length, pointer);
    pointer += 4;
    centralHeader.writeUInt16LE(nameBuffer.length, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt16LE(0, pointer);
    pointer += 2;
    centralHeader.writeUInt32LE(0, pointer); // external attrs
    pointer += 4;
    centralHeader.writeUInt32LE(offset, pointer);
    pointer += 4;
    nameBuffer.copy(centralHeader, pointer);
    central.push(centralHeader);

    offset += localSegment.length;
  });

  const localData = Buffer.concat(locals);
  const centralData = Buffer.concat(central);

  const trailer = Buffer.alloc(22);
  trailer.writeUInt32LE(0x06054b50, 0);
  trailer.writeUInt16LE(0, 4);
  trailer.writeUInt16LE(0, 6);
  trailer.writeUInt16LE(entries.length, 8);
  trailer.writeUInt16LE(entries.length, 10);
  trailer.writeUInt32LE(centralData.length, 12);
  trailer.writeUInt32LE(localData.length, 16);
  trailer.writeUInt16LE(0, 20);

  return Buffer.concat([localData, centralData, trailer]);
};

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const slideTemplate = (title: string, lines: string[], idOffset: number) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="${idOffset}" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${idOffset + 1}" name="Title ${idOffset}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="4000"/>
              <a:t>${escapeXml(title)}</a:t>
            </a:r>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${idOffset + 2}" name="Body ${idOffset}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${lines
            .map(
              (line) => `
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2800"/>
              <a:t>${escapeXml(line)}</a:t>
            </a:r>
            <a:endParaRPr lang="en-US"/>
          </a:p>`
            )
            .join('')}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;

const buildEntries = (result: QueryResult, model: DnDModel, purpose: ReportPurpose, datasetName?: string): ZipEntry[] => {
  const nowIso = new Date().toISOString();
  const summaryLines = [
    `Purpose: ${purpose}`,
    `Dataset: ${datasetName ?? 'N/A'}`,
    `Dimensions: ${model.dims.map((dim) => dim.name).join(', ') || 'All'}`,
    `Measures: ${model.measures.map((measure) => measure.name).join(', ') || 'None'}`,
  ];
  const dataLines = result.rows.slice(0, 6).map((row, idx) => {
    const formatted = result.columns
      .map((column) => `${column}: ${row[column as keyof typeof row]}`)
      .join(' | ');
    return `${idx + 1}. ${formatted}`;
  });

  const entries: ZipEntry[] = [
    {
      name: '[Content_Types].xml',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>\n</Types>`
      ),
    },
    {
      name: '_rels/.rels',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>\n</Relationships>`
      ),
    },
    {
      name: 'docProps/core.xml',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <dc:title>Immersive Report Snapshot</dc:title>\n  <dc:creator>Benten Prototype</dc:creator>\n  <cp:lastModifiedBy>Benten Prototype</cp:lastModifiedBy>\n  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>\n  <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>\n</cp:coreProperties>`
      ),
    },
    {
      name: 'docProps/app.xml',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">\n  <Application>Immersive Report</Application>\n  <Slides>2</Slides>\n</Properties>`
      ),
    },
    {
      name: 'ppt/presentation.xml',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n  <p:sldIdLst>\n    <p:sldId id="256" r:id="rId1"/>\n    <p:sldId id="257" r:id="rId2"/>\n  </p:sldIdLst>\n  <p:notesSz cx="6858000" cy="9144000"/>\n</p:presentation>`
      ),
    },
    {
      name: 'ppt/_rels/presentation.xml.rels',
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>\n  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>\n</Relationships>`
      ),
    },
    {
      name: 'ppt/slides/slide1.xml',
      data: Buffer.from(slideTemplate('Report Summary', summaryLines, 1)),
    },
    {
      name: 'ppt/slides/slide2.xml',
      data: Buffer.from(slideTemplate('Highlights', dataLines.length ? dataLines : ['No data available'], 10)),
    },
  ];

  return entries;
};

export async function POST(request: NextRequest) {
  const { result, model, datasetName, purpose } = (await request.json()) as {
    result: QueryResult;
    model: DnDModel;
    datasetName?: string;
    purpose: ReportPurpose;
  };

  const entries = buildEntries(result, model, purpose, datasetName);
  const pptx = createZip(entries);

  return new Response(pptx, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': 'attachment; filename="report.pptx"',
    },
  });
}
