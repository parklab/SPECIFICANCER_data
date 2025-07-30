"use strict";

import React, { useRef } from "react";
import { HiGlassComponent } from "higlass/dist/hglib";
import { default as higlassRegister } from "higlass-register/dist/higlass-register";
import { default as TextTrack } from "higlass-text/es/TextTrack";
import { BigwigDataFetcher } from "higlass-bigwig-datafetcher";
import viewConfig from "./viewConfig.json";

export class HiglassBrowser extends React.PureComponent {
  constructor(props) {
    super(props);
    this.hgc = React.createRef();
    window.hgc = this.hgc;
    this.viewConfig = viewConfig.viewConfig;
    higlassRegister({
      name: "TextTrack",
      track: TextTrack,
      config: TextTrack.config,
    });
    higlassRegister(
      {
        dataFetcher: BigwigDataFetcher,
        config: BigwigDataFetcher.config,
      },
      { pluginType: "dataFetcher" }
    );
  }

  componentDidMount() {}

  render() {
    return (
      <HiGlassComponent
        viewConfig={this.viewConfig}
        bounded={true}
        ref={this.hgc}
      />
    );
  }
}
