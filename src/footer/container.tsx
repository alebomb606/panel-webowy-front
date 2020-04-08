import React from 'react';

import styled, { css } from './../theme';
import { EmailIcon, PhoneIcon, PlayCircleIcon } from '../common/icons';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { openModal } from '../ui/actions';
import { ModalComponentTypes } from '../ui/reducer';
import { AlertProps } from '../header/components/arm-alert';

function MovieLink({ openTutorialModal }: { openTutorialModal: () => void }) {
  const { t } = useTranslation('footer');
  return (
    <FooterButton onClick={openTutorialModal}>
      <PlayCircleIcon color={'#596f84'} backgroundColor={'#dee7f0'} active={true} wrapperSize={16} iconSize={12} />
      {t`tutorial`}
    </FooterButton>
  );
}

function ContactInfo() {
  const { t } = useTranslation('footer');
  return <Contact>{t`help`}</Contact>;
}

function PhoneLink() {
  return null
  return (
    <FooterLink>
      <PhoneIcon color={'#596f84'} backgroundColor={'#dee7f0'} active={true} wrapperSize={16} iconSize={12} />
      +48 42 277 77 77
    </FooterLink>
  );
}

function EmailLink() {
  return (
    <FooterLink href="mailto:biuro@safeway.pl">
      <EmailIcon color={'#596f84'} backgroundColor={'#dee7f0'} active={true} wrapperSize={16} iconSize={12} />
      office@sternkraft.com
    </FooterLink>
  );
}

interface FooterActions {
  actions: {
    openModal: ActionProp<typeof openModal>;
  };
}
interface FooterProps {}

type Props = FooterActions & FooterProps;

function Footer({ actions }: Props) {
  const { t } = useTranslation();
  const alertProps: AlertProps = {
    labels: {
      cancel: null,
      confirm: t`ok`,
      header: '',
      description: t`tutorial_soon`,
    },
    onConfirm(closeModal) {
      closeModal();
    },
  };

  const openTutorialModal = () => {
    actions.openModal(ModalComponentTypes.alert, alertProps);
  };

  return (
    <Container>
      <Wrapper>
        <Content>
          <MovieLink openTutorialModal={openTutorialModal} />
        </Content>
        <Content>
          <ContactInfo />
          <PhoneLink />
          <EmailLink />
        </Content>
      </Wrapper>
    </Container>
  );
}

const mapStateToProps = (): FooterProps => ({});
const mapDispatchToProps = (dispatch: Dispatch): FooterActions => ({
  actions: {
    openModal: (type, props: AlertProps) => dispatch(openModal(type, props)),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Footer);

const Container = styled.div`
  padding: 12px 24px;
  height: 40px;
  background-color: #dee7f0;
`;

const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 1920px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
`;

const Content = styled.span`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const FooterItem = css`
  border: none;
  background: none transparent;
  margin-left: 12px;
  margin-right: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 600;
  font-style: italic;
  text-decoration: none;
  color: #596f84;
`;

const FooterLink = styled.a`
  ${FooterItem}
`;

const FooterButton = styled.button`
  ${FooterItem}
`;

const Contact = styled.span`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 500;
  font-style: italic;
  color: #596f84;
`;
