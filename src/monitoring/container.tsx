import React, { useEffect,useState } from 'react';
import moment from 'moment';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { spinner } from '../assets';
import CameraPicker from './components/camera-picker';
import DownloadButton from './components/download-button';
import Pickers from './components/pickers';
import Preview from './components/preview';
import Thumbnails from './components/thumbnails';
import {MediaWarning} from './components/media-warning';

import TrailerDescription from './components/trailer-description';

import styled from '../theme';
import { MonitoringCameras, MonitoringCamera } from './types';
import { MediaRequestQuery } from '../api';
import { MonitoringState } from './reducer';
import { State } from '../store';
import { TrailerId } from '../trailers/reducer';
import { getActiveTrailer } from '../trailers/selectors';
import { requestMedia, selectCamera, selectTime} from './actions';
import { getImagesTimeline, getImage, getVideo } from './selectors';


interface MonitoringProps {
  ui: MonitoringState['ui'];
  imagesTimeline: { [date: string]: MonitoringCamera };
  trailerbaseid: string | undefined,
  image: MonitoringCamera | null;
  video: MonitoringCamera | null;
}

interface MonitoringActions {
  actions: {
    requestMedia: ActionProp<typeof requestMedia>;
    selectTime: ActionProp<typeof selectTime>;
    selectCamera: ActionProp<typeof selectCamera>;
  };
}

type Props = MonitoringProps & MonitoringActions;

function MonitoringContainer({ trailerbaseid, image, video, imagesTimeline, ui, actions,error }: Props) {
  const { t } = useTranslation(['monitoring']);
  const [download, setDownload ]=useState(false)
  const [info, setInfo]=useState("")
  const [modal, setModal]=useState(false)
  const { camera, time } = ui;

  if (!trailerbaseid || !camera || !time) {
    return <></>;
  }

  const datetime = moment(time)
      .startOf('minute')
      .toDate();

  useEffect(() => {
    if (!image || !image.id) {
      actions.requestMedia(trailerbaseid, {
        camera,
        time: datetime,
        type: 'photo',
      });
    }
  }, [image && image.id]);

  const videoExists = video !== null && video.snapshotUrl !== null;
  const videoIsLoading = video !== null && video.isLoading === true;

  const requestVideo = () => {
    actions.selectTime(datetime.toISOString());
    if (image && image.snapshotUrl) {
      setDownload(true);
      actions.requestMedia(trailerbaseid, {
        camera,
        time: new Date(time),
        type: 'video',
      });
      setTimeout(() => {
        if(videoExists ===false && videoIsLoading===false && download===true){
          setInfo(t`video_inavailable`)
          setModal(true)
          setDownload(false);
        }
        }
      , 60000)
    }
    else {
      setInfo(t`wait_thumbnails`);
      setModal(true)
    }

  };

  const openVideo = () => {
    if (video) window.open(video.snapshotUrl, '_blank');
  };
  const closeModal = () => {
    setModal(false)
    setDownload(false);
  };


  if (videoIsLoading===true && download===true) {
  setDownload(false);
    setModal(false)
  };
  if(error){
    setInfo("Video is temporarily unavailable.")
    setModal(true)
    setDownload(false);
  }
  return (
      <><Container className="container">
        <Header>{t`monitoring`}</Header>
        <Content>
          <MonitoringDetails>
            <Preview media={video || image} />
            <Pickers
                date={datetime}
                onChange={(date: Date) => actions.selectTime(date.toISOString())}
                setCurrentTime={() => {
                  actions.selectTime(
                      moment()
                          .startOf('minute')
                          .toISOString(),
                  );
                }}
            />
            <Thumbnails
                timeline={imagesTimeline}
                quantity={11}
                date={datetime}
                onThumbClick={date => {actions.selectTime(date.toISOString());  setDownload(false)}}
            />
            {
              videoExists===false && download ?
                  <DownloadButton>
                    {t`requesting`}
                  </DownloadButton>:<DownloadButton onClick={videoExists ? openVideo : requestVideo}>
              {videoExists===false && videoIsLoading===true && t`wait`}
              {videoExists===true && videoIsLoading===false && t`save`}
              {videoExists===false && videoIsLoading===false && t`download`}
              </DownloadButton>
            }
          </MonitoringDetails>
          <TrailerDetails>
            <CameraPicker onChange={actions.selectCamera} picked={camera} />
          </TrailerDetails>
        </Content>
      </Container>
      <MediaWarning closeModal={closeModal} labels={{info:info, open:modal}} /></>
  );
}

const mapStateToProps = (state: State): MonitoringProps => ({
  ui: state.monitoring.ui,
  error: state.monitoring.error,
  process: state.monitoring.process,
  error: state.monitoring.error,
  trailerbaseid: getActiveTrailer(state)?.id,
  imagesTimeline: getImagesTimeline(state),
  image: getImage(state),
  video: getVideo(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>): MonitoringActions => ({
  actions: {
    requestMedia: (id: TrailerId, filter: MediaRequestQuery) => {
      dispatch(requestMedia(id, filter));
    },
    selectCamera: (camera: MonitoringCameras) => {
      dispatch(selectCamera(camera));
    },
    selectTime: (time: string) => {
      dispatch(selectTime(time));
    },

  },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MonitoringContainer);


const Previewa = styled.div`
  width: 100%;
  max-height: calc(100% - 215px);
  position: relative;
  display: flex;
  height:100px;
  align-items: normal;
`;

const PreviewImage = styled.div<{ src?: string; loading: string }>`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-height: 100%;
  display: flex;
  align-items: flex-end;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  background-color: ${({ loading }) => (loading == "true" ? 'transparent' : 'black')};
  background-image: url('${({ src }) => src || ''}');

`;

const VideoStatus = styled.p`
  color:red;
  text-align:center;
`;

const Container = styled.div`
  position: relative;
  width: 600px;
  max-width: 600px;
  height: 95vh;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Header = styled.h5`
  margin-top: 12px;
  margin-bottom: 12px;
  padding-left: 12px;
  display: block;
  align-self: flex-start;
  max-height: 64px;
  font-size: 18px;
  font-weight: 500;
  color: #000000;
  text-transform: capitalize;
`;

const Content = styled.div`
  max-height: calc(100% - 58px);
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const MonitoringDetails = styled.div`
  max-width: 440px;
  max-height: 100%;
  flex: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TrailerDetails = styled.div`
  flex: 80;
  max-width: 160px;
  display: flex;
  flex-direction: column;
`;
