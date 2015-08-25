import React from 'react'
import Router from 'react-router'
import reactor from '../../state/reactor'
import Store from '../../state/main'
import Immutable from 'Immutable'
import RenderLayers from './RenderLayers'
import LayerSelectorGroup from './EditSteps/LayerSelectorGroup'
import ChoosePalette from './EditSteps/ChoosePalette'
import ColorsButtonRotate from '../ColorsButtonRotate'
import LayerImage from './LayerImage'
import CheckButton from '../CheckButton'
var classNames = require('classnames')

export default React.createClass({
  mixins: [reactor.ReactMixin, Router.State, Router.Navigation],

  getDataBindings() {
    return {
      design:           Store.getters.currentDesign,
      currentLayer:     Store.getters.currentLayer,
      numEnabledLayers: Store.getters.numEnabledLayers,
      layerImages:      Store.getters.layerImages
    }
  },

  componentWillMount() {
    Store.actions.selectDesignAndLayerId({
      designId: this.props.params.designId,
      layerId: this.props.params.layerId
    })

    Store.actions.loadAdminLayerImages()
  },

  componentWillUnmount() {
    clearInterval(this._interval)
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps !== this.props || nextState !== this.state) {
      return true
    }
    return false
  },

  componentDidMount() {
    this.attemptLoadResources()

    var self = this
    window.addEventListener('resize', () => self.forceUpdate())
  },

  attemptLoadResources() {
    this._interval = setInterval(() => {
      var svgs = document.querySelectorAll('.canvas svg')
      if (svgs.length === this.state.numEnabledLayers) {
        clearInterval(this._interval)
        Store.actions.loadCurrentDesignEditResources()
      }
    }, 50)
  },

  returnToDesignEdit() {
    this.transitionTo('designEdit', {
      designId: this.state.design.get('id'), 
      layerId: this.state.currentLayer.get('id')
    })
  },

  selectImagesOrColors(imagesOrColors) {
    this.transitionTo('designEditDetail', {
      designId: this.state.design.get('id'), 
      layerId: this.state.currentLayer.get('id'),
      imagesOrColors: imagesOrColors
    })
  },

  render() {
    if (this.state.design == null || this.state.currentLayer == null || this.state.layerImages == null ) { return null }

    var layerImages = this.state.layerImages.slice(0,30).map(layerImage => {
      return <LayerImage layerImage={layerImage} key={layerImage.get('id')}/>
    })
  
    var isPortrait = window.innerHeight > window.innerWidth
    var selectingColors = this.getParams().imagesOrColors === 'colors'

    return (
      <section className="main design-edit-detail">
        <div className="edit-ui">

          <div className="edit-ui-canvas">
            { isPortrait ? <LayerSelectorGroup isPortrait={isPortrait}/> : null}
            <div className="canvas-flex-wrapper">
              <span>
                <RenderLayers layers={this.state.design.get('layers')}/>
              </span>
            </div>
          </div>

          <div className="edit-ui-detailed">
            { isPortrait ? null : <LayerSelectorGroup isPortrait={isPortrait}/> }
            <div className="edit-ui-mid">
              <ColorsButtonRotate className="rotate-colors" isSmall={false}/>
              <div onClick={this.selectImagesOrColors.bind(null, 'images')} className={classNames("button", {off: selectingColors})}>Art</div>
              <div onClick={this.selectImagesOrColors.bind(null, 'colors')} className={classNames("button", {off: !selectingColors})}>Color</div>
              <CheckButton onClick={this.returnToDesignEdit} isSmall={false}/>
            </div> 
            <div className="edit-ui-bottom">
              { selectingColors ? <ChoosePalette/> : layerImages }
            </div>
          </div>
        </div>
      </section>
    )
  }
})
