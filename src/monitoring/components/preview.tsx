import React from 'react';
import moment from 'moment';

import styled from '../../theme';
import { spinner } from '../../assets';
import { MonitoringCamera, MonitoringCameras } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  media: MonitoringCamera | null;
}

export default function({ media }: Props) {
  const { t } = useTranslation('monitoring');
  if (!media || !media.snapshotUrl) {
    return (
      <Preview>
        <PreviewImage src={spinner} loading={'true'} />
      </Preview>
    );
  }
  const Player = ({ video }: any) => <PreviewVideo src={video.snapshotUrl} controls />;
  return (
    <Preview>
      <InfoBar position="top">
        <Left>{t('camera', { camera: t(MonitoringCameras.toReadableName(media.type)) })}</Left>
        <Right>{media.eventDate && moment(media.eventDate).format('LT')}</Right>
      </InfoBar>
      {media.snapshotUrl && (
        <PreviewImage loading={String(media.isLoading) || 'false'} src={media.snapshotUrl}>
          {media.mediaType === 'video' && <Player video={media} />}
        </PreviewImage>
      )}
      {/* Info Who download this clip disabled for now to not let customer know we are downloading those things- TODO: fix this */}
      {/* {media.logistician && (
        <InfoBar position="bottom">
          <Center>
            {t('downloaded_by', {
              date: moment(media.downloadDate).format('L'),
              username: `${media.logistician.firstName} ${media.logistician.lastName}`,
            })}
          </Center>
        </InfoBar>
      )} */}
    </Preview>
  );
}

const Preview = styled.div`
  width: 100%;
  max-height: calc(100% - 215px);
  position: relative;
  display: flex;
  flex: 640;
  align-items: normal;
`;

const PreviewVideo = styled.video`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 99.5%;
  height: 99.5%;
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
  margin-bottom:39px
`;

const Left = styled.div`
  padding: 5px;
  float: left;
  line-height: 2;
`;

const Right = styled.div`
  padding: 5px;
  float: right;
  line-height: 2;
`;

const Center = styled.div`
  width: 100%;
  text-align: center;
  line-height: 2;
`;

const InfoBar = styled.div<{ position: 'top' | 'bottom' }>`
  position: absolute;
  left: 1px;
  width: 99.5%;
  height: 40px;
  color: white;
  background-color: #232f34;
  opacity: 0.7;
  z-index: 100;
  ${({ position }) => position}: 0;
  &::first-letter {
    text-transform: capitalize;
  }
`;
