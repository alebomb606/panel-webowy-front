import React from 'react';
import { useTranslation } from 'react-i18next';

import { EyeOutlineIcon, EyeOffOutlineIcon } from '../../common/icons';
import styled from '../../theme';
import {MonitoringState} from "../../monitoring/reducer";
import {State} from "../../store";
import {getTrailerSensors} from "../../sensors/selectors";
import {getSnapshotForTime} from "../../monitoring/selectors";
import {ThunkDispatch} from "redux-thunk";
import {bindActionCreators} from "redux";
import {fetchSensors} from "../../sensors/actions";
import {fetchEvents} from "../../events/actions";
import {fetchMedia, requestMedia, selectCamera, selectTime} from "../../monitoring/actions";
import {openModal} from "../../ui/actions";
import {connect} from "react-redux";
import {MonitoringCamera, CameraSetting} from "../../monitoring/types";
import {ModalComponentTypes} from "../../ui/reducer";

export interface PreviewImageProps {
  src?: string;
  active?: boolean;
  shouldRenderDetails?: boolean;
  monitoring?: MonitoringState;
  alert?: MonitoringState['error'];
  ui: MonitoringState['ui'];
  camera?: MonitoringCamera;
  setting?: CameraSetting;
}

interface PreviewImageActions {
    actions: {
        openModal: ActionProp<typeof openModal>;
    };
}

type Props = PreviewImageActions & PreviewImageProps;

function PreviewImage({
                        src,
                        shouldRenderDetails,
                        alert ,
                        monitoring,
                        ui,
                        camera,
                        actions,
                        setting,
                      }: Props) {
  if (src) {
    return <Preview src={src} />;
  }

  const { t } = useTranslation('monitoring');

  // console.log("ImagePreview render, alert: ", monitoring, monitoring?.ui?.camera, ui?.camera, camera?.type);
  return (
    <Thumbnail>
      { !setting?.installedAt && (
        <>
          <EyeOffOutlineIcon wrapperSize={30} iconSize={30} color={'gray'} backgroundColor={'transparent'} active={true} />
          { shouldRenderDetails && <ErrorInfo>{t`camera_not_installed`}</ErrorInfo> }
          { !shouldRenderDetails && <ErrorSmallInfo>{t`camera_not_installed`}</ErrorSmallInfo> }
        </>
      )}
      { setting?.installedAt && (
        <>
          { alert && (camera?.type == ui?.camera)
              ? <EyeOutlineIcon wrapperSize={30} iconSize={30} color={'#d75d30'} backgroundColor={'transparent'} active={false}
                  onClick = { () => {
                    actions.openModal(ModalComponentTypes.mediaWarning, { labels: { type: camera?.type } } );
                  } }
                />
              : <EyeOutlineIcon wrapperSize={30} iconSize={30} color={'#4390e5'} backgroundColor={'transparent'} active={true} />
          }
          { alert && (camera?.type == ui?.camera)
              ? (shouldRenderDetails ? <ErrorInfo>{t`download_photo_na`}</ErrorInfo> : <ErrorSmallInfo>{t`download_photo_na`}</ErrorSmallInfo>)
              : (shouldRenderDetails ? <Info>{t`download_photo`}</Info> : <SmallInfo>{t`download_photo`}</SmallInfo>)
          }
        </>
      )}

    </Thumbnail>
  );
}

const mapStateToProps = (state: State): PreviewImageProps => ({
  monitoring: state.monitoring,
  alert: state.monitoring.error,
  ui: state.monitoring.ui,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): PreviewImageActions => ({
    actions: bindActionCreators(
        {
            openModal,
        },
        dispatch,
    ),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PreviewImage);

const Preview = styled.div<PreviewImageProps>`
  background:  url('${({ src }) => src}') center center no-repeat;
  background-size: cover;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`;

const Thumbnail = styled.div`
  user-select: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Info = styled.div`
  user-select: none;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 1.6;
  text-align: center;
  color: #4390e5;
  text-transform: uppercase;
`;

const SmallInfo = styled(Info)`
  user-select: none;
  margin-top: 0;
  font-size: 6px;
  letter-spacing: 1.3;
`;

const ErrorInfo = styled(Info)`
  color: #d75d30;
`;

const ErrorSmallInfo = styled(SmallInfo)`
  color: #d75d30;
`;
