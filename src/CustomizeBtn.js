import React, { Component } from 'react';
import { Button, Collapse, Card, CardBody } from 'reactstrap';
import config from './config';


class CustomizeBtn extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: true };
  }

  onClick() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <div className='customize-btn'>
        <Collapse isOpen={this.state.isOpen}>
          <Card>
            <CardBody>
              {
                Object.keys(config.poi_type_lookup).map(key => {
                  return (<ToggleButton key={key} id={key}
                    name={config.poi_type_lookup[key]}
                    filter={this.props.filter}
                    onCustomize={this.props.onCustomize}/>);
                })
              }
              <Button color='warning' onClick={this.props.onClearCustomize}>Clear</Button>
            </CardBody>
          </Card>
        </Collapse>
        <Button color='primary' onClick={this.onClick.bind(this)} className='customize-btn'>
          { this.state.isOpen ? 'Hide' : 'Customize Experience' }
        </Button>
      </div>
    );
  }
}

class ToggleButton extends Component {
  render() {
    const anyOn = Object.keys(this.props.filter).some(key => this.props.filter[key]);
    const on = (!anyOn) ? false : this.props.filter[this.props.id];
    return (
      <Button color='success'
        outline={!on}
        onClick={this.props.onCustomize.bind(this, this.props.id)}>{this.props.name}</Button>
    );
  }
}

export default CustomizeBtn;
