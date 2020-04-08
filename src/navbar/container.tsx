import React from 'react';
import { connect } from 'react-redux';
import { darken } from 'polished';
import { Link, RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthState } from '../auth/reducer';
import { logo } from '../assets';
import { logout } from '../auth/actions';
import { State } from '../store';
import styled from './../theme';
import { ThunkDispatch } from 'redux-thunk';

interface MenuItemProps {
  active?: boolean;
}

const Logo = styled.img`
  margin: 19px 70px;
`;

interface NavbarState {
  auth: AuthState;
}

interface NavbarActions {
  actions: {
    logout: ActionProp<typeof logout>;
  };
}

type NavbarProps = NavbarState & NavbarActions;

function Navbar({ auth, actions, location }: NavbarProps & RouteComponentProps<{}>) {
  if (!auth.token) {
    return null;
  }

  const { t, i18n } = useTranslation('navbar');

  return (
    <NavbarContainer>
      <Logo src={logo} />
      <Menu>
        <MenuItem active={Boolean(location.pathname.match(/^\/trailer/))}>
          <Link to="/trailers">{t`trailers`}</Link>
        </MenuItem>
        <MenuItem active={Boolean(location.pathname.match(/^\/map/))}>
          <Link to="/map">{t`map`}</Link>
        </MenuItem>
        <MenuItem active={Boolean(location.pathname.match(/^\/whatsnew/))}>
          <Link to="/whatsnew">{t`whatsnew`}</Link>
        </MenuItem>
      </Menu>
      <LangMenu>
        <Lang onClick={() => i18n.changeLanguage('pl')}>PL</Lang>
        <Lang onClick={() => i18n.changeLanguage('en')}>EN</Lang>
        <Lang onClick={() => i18n.changeLanguage('de')}>DE</Lang>
      </LangMenu>
      <UserMenu>
        <Logout onClick={() => actions.logout()}>{t`logout`}</Logout>
      </UserMenu>
    </NavbarContainer>
  );
}

const mapStateToProps = (state: State): NavbarState => ({ auth: state.auth });

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): NavbarActions => ({
  actions: {
    logout: () => dispatch(logout()),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navbar);

const NavbarContainer = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: row;
  height: 70px;
`;

const Menu = styled.ol`
  margin: 0;
  padding: 0;
  width: 30%;
  min-width: 400px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  list-style: none;
`;

const UserMenu = styled(Menu)`
  margin-top: 14px;
  margin-bottom: 14px;
  justify-content: center;
  min-width: unset;
`;

const Logout = styled.button`
  border: 0;
  background: none;
  outline: none;
  cursor: pointer;
`;

const LangMenu = styled(Menu)`
  justify-content: flex-end;
`;

const Lang = styled.button`
  border: 0;
  background: none;
  outline: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const MenuItem = styled.li<MenuItemProps>`
  background-color: ${props => (props.active ? '#4a90e2' : '#ffffff')};
  flex: 1;
  font-size: 14px;
  font-weight: bold;
  max-width: 120px;
  & a {
    color: ${props => (props.active ? '#ffffff' : '#9b9b9b')};
    display: inline-block;
    line-height: 70px;
    text-align: center;
    text-decoration: none;
    width: 100%;
    &::first-letter {
      text-transform: uppercase;
    }
  }
  &:hover {
    background-color: ${props => (props.active ? darken(0.1, '#4a90e2') : darken(0.1, '#ffffff'))};
    & a {
      color: ${props => (props.active ? darken(0.1, '#ffffff') : darken(0.1, '#9b9b9b'))};
    }
  }
`;
