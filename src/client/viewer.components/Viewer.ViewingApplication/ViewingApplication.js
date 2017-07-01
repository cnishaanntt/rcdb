//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
import './ViewingApplication.scss'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import React from 'react'

class ViewingApplication extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    panels: PropTypes.array
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    panels: []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.height = 0

    this.width = 0
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  guid (format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadDocument (urn) {

    const itemIndex = this.props.itemIndex || 0

    const _urn = !urn.startsWith('urn:')
      ? 'urn:' + urn
      : urn

    this.viewingApp.loadDocument(_urn, (doc) => {

      console.log(doc)

      const viewables = this.viewingApp.bubble.search({
        'role': '3d'
      })

      console.log(viewables)

      if (!viewables || viewables.length-1 < itemIndex) {

        console.error('Viewable path invalid ...')
        return
      }

      this.viewingApp.selectItem(viewables[0].data,
        (viewer, item) => {

          this.viewer = viewer

          if (this.props.onViewerCreated) {

            this.props.onViewerCreated(
              this.viewer)
          }

          if (this.props.onItemLoaded) {

            this.props.onItemLoaded(item)
          }

      }, () => {

      })

    }, (error) => {

      console.log('Error loading document: ' + error)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.viewerContainer.id = this.guid()

    this.viewingApp = new Autodesk.Viewing.ViewingApplication(
      this.viewerContainer.id)

    this.viewingApp.registerViewer(
      this.viewingApp.k3D,
      Autodesk.Viewing.Private.GuiViewer3D)

    if (this.props.urn) {

      this.loadDocument(this.props.urn)
    }

    if (this.props.onViewingApplicationCreated) {

      this.props.onViewingApplicationCreated(
        this.viewingApp)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    if (this.props.urn !== props.urn) {

      this.loadDocument(props.urn)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    if (this.viewer && this.viewer.impl) {

      if (this.viewerContainer.offsetHeight !== this.height ||
        this.viewerContainer.offsetWidth !== this.width) {

        this.height = this.viewerContainer.offsetHeight
        this.width = this.viewerContainer.offsetWidth

        this.viewer.resize()
      }
    }

    this.props.panels.map((panel) => {

      panel.emit('update')
    })
  }

  /////////////////////////////////////////////////////////
  // Component will unmount so we can destroy the viewer to avoid
  // memory leaks
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    if (this.viewer) {

      if(this.viewer.impl.selector) {

        this.viewer.tearDown()
        this.viewer.finish()
        this.viewer = null
      }
    }
  }

  /////////////////////////////////////////////////////////
  // Render component, resize the viewer if exists
  //
  /////////////////////////////////////////////////////////
  render() {

    const panels = this.props.panels.map((panel) => {

      return panel.render()
    })

    return (
      <div className="viewer-app-container">
        <div className="viewer-container" ref={
          (div) => this.viewerContainer = div
          }/>
        <div className="viewer-panels-container">
          { panels }
        </div>
      </div>
    )
  }
}

export default ViewingApplication
