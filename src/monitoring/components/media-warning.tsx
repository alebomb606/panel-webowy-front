import {Trans, useTranslation} from "react-i18next";
import React from "react";
import styled from "../../theme";

interface OwnProps {
    closeModal: () => void;
}

export interface StaticProps {
    labels: {
        header?: string;
        description: string;
        info?: string;
        confirm?: string;
        close?: string | null;
        open: boolean;
    };
}

export function MediaWarning(props: StaticProps & OwnProps ) {
    const { closeModal, labels } = props;

    const { t } = useTranslation('common');

    const {  description, header = t`info`, info = '', close = t`close`, open } = labels;

    return (
        <>
        {open &&
    <div>
        <Container>
            <Header>{header}</Header>
            <Description>
                {info}
            </Description>
            <Info></Info>
            <ButtonsWrapper>
                {close !== null && <CancelButton onClick={() => closeModal()}>{close}</CancelButton>}
            </ButtonsWrapper>
        </Container>
    </div>
        }
        </>
    );
}

//FIXME Need to extract all designs of modal windows into a common code

const Container = styled.div`
  background: white;
    width: 100%;
    position: fixed;
    padding: 35px 40px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background-color: #ffffff;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 23048;
`;

const Header = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  color: #d0021b;
  text-align: center;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const Description = styled(Header)`
  margin-top: 20px;
  max-width: 405px;
  color: #000000;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const Info = styled.div`
  margin-top: 15px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  color: #000000;
  text-align: center;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const ButtonsWrapper = styled.div`
  margin-top: 50px;
`;

const CancelButton = styled.button`
  margin: 5px;
  padding: 8px 50px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: #4a90e2;
  text-align: center;
  background-color: #f4f6f8;
  border-radius: 4px;
  border: none;
  outline: none;
  cursor: pointer;
  &::first-letter {
    text-transform: capitalize;
  }
`;
