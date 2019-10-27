import React from "react";


var {
    CWorkbench,
    CGroup, cmember,
    CNameSpace,
    CQuantifiedList,
    CSelect, ccase, cdefault, unansweredCase,
    CString,
    CTOCEntry,
    renderTree, rootPath,
    NamedAdder,
    Problems,
    TOC,
    VTOC,
} = require("opencpq");

var {
    PanelGroup, Panel,
} = require("react-bootstrap");

var { VBOM, getPrice } = require("../lib/bom.js");
var { cmemberNV, cmemberTOC, ccaseBOM, cintegerBOM, onlyIf, cforbidden,
        cassert } = require("../lib/utils");
var components = require("../resources/components.json");

const model = CGroup([
    cmember("size", "Size", CSelect([
        ccase("XXS"),
        ccase("XS"),
        ccase("S"),
        cdefault(ccase("M")),
        ccase("L"),
        ccase("XL"),
        ccase("XXL"),
    ])),
    cmember("color", "Color", CSelect([
        unansweredCase("Select Color"),
        ccase("red"),
        ccase("green"),
        ccase("blue"),
    ])),
    cmember("text", "Text to print on your T-shirt:", CString()),
]);

const model2 = CGroup([
    cmember("size", "Size", CSelect([
        ccase("XXS"),
        ccase("XS"),
        ccase("S"),
        cdefault(ccase("M")),
        ccase("L"),
        ccase("XL"),
        ccase("XXL"),
    ])),
    cmember("color", "Color", CSelect([
        unansweredCase("Select Color"),
        ccase("red"),
        ccase("green"),
        ccase("blue"),
    ])),
    cmember("text", "Text to print on your T-shirt:", CString()),
]);

var configuration =
    CTOCEntry(
        "frame",
        (node, {rowIndex, quantity}) => `#${rowIndex+1}: ${quantity === 1 ? "" : `${quantity} \u00d7`} ${node.value}`,
        CNameSpace("productProps", CSelect([
            ccase("In"),
            ccase("Middle"),
            ccase("Out"),
        ]))
    );


/// aktuelle configuration
const config = CNameSpace("config",
    // insert cmemberTOC (utils.js)
    CGroup([
        cmember("size", "Size", CSelect([
            ccase("XXS"),
            ccase("XS"),
            ccase("S"),
            cdefault(ccase("M")),
            ccase("L"),
            ccase("XL"),
            ccase("XXL"),
        ])),
        cmember("color", "Color", CSelect([
            unansweredCase("Select Color"),
            ccase("red"),
            ccase("green"),
            ccase("blue"),
        ])),
        cmember("text", "Text to print on your T-shirt:", CString()),
    ]));


// release erforderlich für solution
var release = CSelect([
    ccase("R1.0", "1.0"),
    ccase("R1.1", "1.1"),
    ccase("R2.0", "2.0"),
]);

// machineType can be used as a group member on multiple levels.  It only
// "materializes" if we do not yet have an "inherited" value.
/*
var machineType = ({ inheritableMachineProps }) => {
    if (inheritableMachineProps.machineType == undefined)
        return cmemberNV("inheritableMachineProps", "machineType", "Machine Type", CSelect([
            ccase("R:doga", "Dogaseptic"),
            ccase("R:flex", "Flexcup"),
            ccase("R:master", "Mastercup"),
        ]));
};
*/

var machineType = cmember("machineType", "Machine Type", CSelect([
            ccase("R:doga", "Dogaseptic"),
            ccase("R:flex", "Flexcup"),
            ccase("R:master", "Mastercup"),
        ]));

var machine = CTOCEntry("rack", (node, { rowIndex, quantity }) => `#${rowIndex + 1}: ${quantity === 1 ? "Frame_" : `${quantity} Racks`}`,
        CGroup(({ solutionProps }) => [
        machineType,
        //cmemberNV("rackProps", "UPS", "Uninterruptible Power Supply", CBoolean({defaultValue: solutionProps == undefined ? undefined : solutionProps.UPS})),
        cmember("switches", "Frame", CQuantifiedList({}, "Technology", opticalSwitches)),
    ])
);

/*
var frames = cmember("frameType", "Frame Type", CSelect([
    ccase("in", "In-Frame"),
    ccase("mid", "Middel-Frame"),
    ccase("out", "Out-Frame"),
]));
*/

var frame = cmember("frame", "Frame Type", CQuantifiedList({}, "Frames", CString()));

var solution = CNameSpace("solution", CGroup([
    machineType,
    frame,
    ({ value = {} }) =>
        value.text && value.text.trim().length > 0
    ? cmember("color", "Color", CSelect([
        unansweredCase("Select Color"),
        ccase("red"),
        ccase("green"),
        ccase("blue"),
    ])) : null,
    cmember("text", "Text to print on your T-shirt:", CString()),

/*
    cmemberTOC("project", "Project Settings", CGroup([
        machineType,
        cmemberNV("solution", "release", "Version", release),
    ])),
 */
   // cmember("frames", "Machine Architecture", CQuantifiedList({}, "Modules", machine)),
]));



const workbench = CWorkbench(
    ctx => ({ bom: VBOM(ctx) }),
    (innerNode, { bom }) => {
        function colStyle(percent) {
            return {
                width: `${percent}%`,
                minWidth: `${percent}%`,
                overflow: "auto",
            };
        }
        return <div style={{ minWidth: "100%", display: "flex" }}>
            <div style={{...colStyle(70)}}>
				<PanelGroup>
					<Panel header={<h3>Configuration</h3>}>
						{innerNode.render()}
					</Panel>
				</PanelGroup>
            </div>
            <div style={{ ...colStyle(30), flex: "1 1 auto" }}>
                <PanelGroup>
                    <Panel header={<h3>Bill of Materials</h3>}>
                        {bom.render()}
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    },
    solution//config
);

renderTree(
    workbench,
    undefined,
    () => ({
        path: rootPath,
        problems: new Problems(),
        bom: new NamedAdder(),
    }),
    document.getElementsByTagName("body")[0]
);