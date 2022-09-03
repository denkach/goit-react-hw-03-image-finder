import { Component } from 'react';
import { Box } from './Box';
import { SearchBar } from './SearchBar/SearchBar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Modal } from './Modal/Modal';
import imagesAPI from '../services/images-api';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export class App extends Component {
  state = {
    name: '',
    page: 1,
    showModal: false,
    modalImageSrc: '',
    images: [],
    error: '',
    status: Status.IDLE,
  };

  componentDidUpdate(prevProps, prevState) {
    const { name: prevName, page: prevPage } = prevState;
    const { name: nextName, page: nextPage } = this.state;

    const images = this.state.images;

    if (prevName !== nextName || prevPage !== nextPage) {
      if (images.length === 0 || prevName !== nextName) {
        this.setState({ status: Status.PENDING });
      }

      imagesAPI
        .fetchImages(nextName, nextPage)
        .then(({ hits }) => {
          if (hits.length === 0) {
            return Promise.reject(new Error('No images found'));
          }
          this.setState(prevState => {
            return prevName !== nextName
              ? {
                  images: hits,
                  status: Status.RESOLVED,
                  error: '',
                }
              : {
                  images: [...prevState.images, ...hits],
                  status: Status.RESOLVED,
                  error: '',
                };
          });
        })
        .catch(({ message }) =>
          this.setState({
            error: message,
            status: Status.REJECTED,
            images: [],
          })
        );
    }
  }

  onFormSubmit = title => {
    this.setState({ name: title, page: 1 });
  };

  onBtnClick = () => {
    this.setState(prevState => {
      return { page: prevState.page + 1 };
    });
  };

  toggleModal = () => {
    this.setState(prevState => {
      return { showModal: !prevState.showModal };
    });
  };

  onGalleryItemClick = name => {
    this.toggleModal();
    this.setState({ modalImageSrc: name });
  };

  render() {
    const { modalImageSrc, showModal, error, images, status } = this.state;
    return (
      <Box display="grid" gridTemplateColumns="1fr" gridGap="16px" pb="24px">
        <SearchBar onSubmit={this.onFormSubmit} />
        <ImageGallery
          error={error}
          images={images}
          status={status}
          onClick={this.onGalleryItemClick}
        />
        {images && images.length > 0 && status === 'resolved' && (
          <Button onClick={this.onBtnClick} />
        )}
        {showModal && (
          <Modal largeImageURL={modalImageSrc} onClose={this.toggleModal} />
        )}
      </Box>
    );
  }
}
