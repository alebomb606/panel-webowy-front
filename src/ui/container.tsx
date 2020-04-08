import React from 'react';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import styled from '../theme';
import { ModalComponents, UiState } from './reducer';
import { State } from '../store';
import { closeModal } from './actions';

interface ModalProps {
  ui: UiState;
}

interface ModalActions {
  actions: {
    closeModal: () => void;
  };
}

function ModalComponent(props: ModalProps & RouteComponentProps & ModalActions) {
  const { ui, actions } = props;
  const Component = ui.modal.open && ui.modal.type && ModalComponents[ui.modal.type];
  return (
    <>
      <GlobalStyle blur={ui.modal.open} />
      {Component && (
        <Overlay onClick={() => actions.closeModal()}>
          <Modal onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
            <Component {...ui.modal.props} closeModal={() => actions.closeModal()} />
          </Modal>
        </Overlay>
      )}
    </>
  );
}

const mapStateToProps = ({ ui }: State): ModalProps => ({
  ui,
});

const mapDispatchToProps = (dispatch: Dispatch): ModalActions => ({
  actions: {
    closeModal: () => dispatch(closeModal()),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ModalComponent);

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
`;

const Modal = styled.div`
  display: inline-block;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  min-width: 200px;
  min-height: 200px;
  background: #ffffff;
  border: 5px solid white;
  z-index: 10000;
`;

const GlobalStyle = createGlobalStyle<{ blur: boolean }>`
  img[draggable=false][role=presentation][src^="https://maps.googleapis.com/maps/vt"] {
    filter: brightness(230%) contrast(110%);
  }
  .container-element {
    & > * > :nth-child(2),
    & > * > :nth-child(3) {
      display: none !important;
    }
  }
  .react-datepicker__time-container, 
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
    width: 85px !important;
  }
  .react-datepicker__input-error {
    outline: #dc3545 auto 5px !important;
    outline-offset: -2px;
  }
  body {
    box-sizing: border-box;
    margin: 0;
    min-height: 100%;
    font-family: 'IBM Plex Sans', Helvetica;
    div#app {
      box-sizing: border-box;
      min-height: 100%;
      & > :not(${Overlay}) {
        ${({ blur }) => `filter: ${blur ? 'blur(2px) brightness(0.7)' : 'blur(0)'};`}
        transition: 0.1s filter ease-in;
      }
      font-family: 'IBM Plex Sans', Helvetica;
      * {
        box-sizing: border-box;
        font-family: 'IBM Plex Sans', Helvetica;
      }
    }
  }
  .fade-enter {
    opacity: 0.01;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0.01;
    transition: opacity 500ms ease-in;
  }
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  div[src*="/spinner"] {
    background-size: 30%;
  }
  div[src*="/spinner"],
  img[src*="/spinner"] {
    animation: rotating 1.5s steps(12) infinite;
  }
`;
