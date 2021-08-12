import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Icon from '@mdi/react';
import { mdiCheck, mdiClose, mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { shade, tint, getLuminance, darken, readableColor } from 'polished';

import { Components, ListRange, Virtuoso } from 'react-virtuoso';
import { useTheme } from '../../context';
import Button from '../Button/Button';
import variants from '../../enums/variants';
import timings from '../../enums/timings';
import { Div, Span } from '../../htmlElements';
import Tag, { TagProps } from '../Tag/Tag';
import { getFontColorFromVariant, getBackgroundColorFromVariant } from '../../utils/color';
import { SubcomponentPropsType, StyledSubcomponentType } from '../commonTypes';
import { getShadowStyle, getDropdownTagStyle } from '../../utils/styles';
import { mergeRefs } from '../../utils/refs';

export type OptionProps = {
  id: number | string;
  optionValue: ReactNode;
  isSelected?: boolean;
};

type UsefulDropdownState = {
  color: string;
  multi?: boolean;
  selected?: boolean;
  variant: variants;
};

const Container = styled(Div)`
  ${({ elevation, isOpen }) => {
    const { colors } = useTheme();
    return `
      width: fit-content;
      transition: filter ${timings.slow}, box-shadow ${timings.slow};
      ${getShadowStyle(elevation, colors.shadow)}
      position: relative;
      z-index: ${isOpen ? '7' : '1'};
    `;
  }}
`;
// TODO - Add constants for width
export const ValueContainer = styled(Button.Container)`
  ${({ isOpen }) => `
    user-select: none;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;

    ${
      isOpen
        ? `
          border-bottom: 0px solid transparent;
          border-bottom-right-radius: 0rem;
          border-bottom-left-radius: 0rem;
        `
        : ''
    }

    width: 15rem;
    padding: .5rem 1rem;
  `}
`;

// TODO: Don't use explicit height here - this div is ending up larger than the icon otherwise
export const CloseIconContainer = styled(Div)`
  height: 1.125rem;
  z-index: 1;
`;

export const ArrowIconContainer = styled(Div)`
  height: 1.125rem;
  z-index: 1;
`;

const ValueItem = styled(Div)`
  width: 100%;
  text-align: left;
`;

const OptionsContainer = styled(Div)`
  ${({ color, variant, isVirtual }: UsefulDropdownState & { isVirtual: boolean }) => `
    background: white;
    position: absolute;
    top: 100%;
    left: 0px;
    ${isVirtual ? 'height: 10rem;' : 'max-height: 10rem;'}
    overflow-y: auto;
    width: 15rem;
    ${
      variant !== variants.text
        ? `
            border: 1px solid ${color};
          `
        : ''
    }
    border-top: 0px solid transparent;
    border-radius: 0rem 0rem 0.25rem 0.25rem;
    z-index: 1000;
  `}
`;

const OptionItem = styled(Div)`
  ${({ selected, color, variant }: UsefulDropdownState) => {
    const { colors } = useTheme();
    const unselectedBgColor = getBackgroundColorFromVariant(variant, color);
    const selectedBgColor = getLuminance(color) > 0.5 ? shade(0.125, color) : tint(0.5, color);
    const backgroundColor = selected ? selectedBgColor : unselectedBgColor;

    return `
      user-select: none;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      color: ${
        selected
          ? readableColor(backgroundColor, colors.background, color, true)
          : getFontColorFromVariant(variant, color)
      };
      background-color: ${backgroundColor};

      &:hover {
        background-color: ${
          backgroundColor !== 'transparent' ? darken(0.05, backgroundColor) : 'rgba(0, 0, 0, 0.05)'
        };

        cursor: pointer;
        outline: none;
      }
      &:focus {
        outline: none;
        background-color: ${
          backgroundColor !== 'transparent' ? darken(0.05, backgroundColor) : 'rgba(0, 0, 0, 0.1)'
        };
      }
    `;
  }}
`;
const CheckContainer = styled(Div)`
  ${({ color }: UsefulDropdownState) => {
    const { colors } = useTheme();
    const backgroundColor = getLuminance(color) > 0.5 ? shade(0.125, color) : tint(0.5, color);

    return `
      display: flex;
      align-items: center;
      justify-content: center;

      color: ${readableColor(backgroundColor, colors.background, color, true)};
      padding-right: 0.2rem;
      width: 2rem;
    `;
  }}
`;

const PlaceholderContainer = styled(Span)`
  opacity: 0.8;
`;

const StyledTagContainer = styled(Tag.Container)`
  ${({
    dropdownVariant,
    tagVariant,
    dropdownColor,
    transparentColor,
  }: {
    dropdownVariant: variants;
    tagVariant: variants;
    dropdownColor: string;
    transparentColor: string;
  }) => `
    ${
      tagVariant === variants.text
        ? `
          padding: 0;
          line-height: 1;
          margin-top: 0 !important;
        `
        : ''
    }
    ${getDropdownTagStyle(dropdownVariant, tagVariant, dropdownColor, transparentColor)}
  `}
`;

export interface DropdownProps {
  StyledContainer?: StyledSubcomponentType;
  StyledValueContainer?: StyledSubcomponentType;
  StyledValueItem?: StyledSubcomponentType;
  StyledOptionsContainer?: StyledSubcomponentType;
  StyledOptionItem?: StyledSubcomponentType;
  StyledCheckContainer?: StyledSubcomponentType;
  StyledPlaceholder?: StyledSubcomponentType;
  StyledCloseIconContainer?: StyledSubcomponentType;
  StyledArrowIconContainer?: StyledSubcomponentType;

  containerProps?: SubcomponentPropsType;
  valueContainerProps?: SubcomponentPropsType;
  valueItemProps?: SubcomponentPropsType;
  optionsContainerProps?: SubcomponentPropsType;
  optionItemProps?: SubcomponentPropsType;
  checkContainerProps?: SubcomponentPropsType;
  placeholderProps?: SubcomponentPropsType;
  closeIconProps?: SubcomponentPropsType;
  arrowIconProps?: SubcomponentPropsType;
  valueItemTagProps?: TagProps;

  containerRef?: React.RefObject<HTMLElement>;
  optionsContainerRef?: React.RefObject<HTMLElement>;
  optionItemRef?: React.RefObject<HTMLElement>;
  valueContainerRef?: React.RefObject<HTMLButtonElement>;
  valueItemRef?: React.RefObject<HTMLElement>;
  checkContainerRef?: React.RefObject<HTMLElement>;
  placeholderRef?: React.RefObject<HTMLElement>;
  closeIconRef?: React.RefObject<HTMLElement>;
  arrowIconRef?: React.RefObject<HTMLElement>;

  color?: string;
  elevation?: number;
  multi?: boolean;
  name?: string;
  placeholder?: string;

  componentUUID?: string;

  onBlur?: () => void;
  onClear?: () => void;
  onFocus?: () => void;
  onSelect: (selected?: Array<string | number>) => void;

  rememberScrollPosition?: boolean;

  values?: Array<string | number>;
  options?: Array<OptionProps>;
  tabIndex?: number;
  variant?: variants;
  optionsVariant?: variants;
  valueVariant?: variants;

  virtualizeOptions?: boolean;
}

const Dropdown = ({
  StyledContainer = Container,
  StyledValueContainer = ValueContainer,
  StyledValueItem = ValueItem,
  StyledOptionsContainer = OptionsContainer,
  StyledOptionItem = OptionItem,
  StyledCheckContainer = CheckContainer,
  StyledPlaceholder = PlaceholderContainer,
  StyledCloseIconContainer = CloseIconContainer,
  StyledArrowIconContainer = ArrowIconContainer,

  containerProps,
  valueContainerProps,
  valueItemProps,
  optionsContainerProps,
  optionItemProps,
  checkContainerProps,
  placeholderProps,
  closeIconProps,
  arrowIconProps,
  valueItemTagProps = {},

  containerRef,
  optionsContainerRef,
  optionItemRef,
  valueContainerRef,
  valueItemRef,
  checkContainerRef,
  placeholderRef,
  closeIconRef,
  arrowIconRef,

  color,
  elevation = 0,
  multi = false,
  name = 'dropdown',
  placeholder,

  onBlur,
  onFocus,
  onClear,
  onSelect,
  options = [],
  tabIndex = 0,
  variant = variants.outline,
  optionsVariant = variants.outline,
  rememberScrollPosition = true,
  valueVariant = variants.text,
  values = [],

  virtualizeOptions = true,
}: DropdownProps): JSX.Element | null => {
  const { colors } = useTheme();
  const defaultedColor = color || colors.grayDark;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerInternalRef = useRef<HTMLDivElement>(null);
  const optionsContainerInternalRef = useRef<HTMLDivElement>(null);

  const [focusWithin, setFocusWithin] = useState<boolean>(false);
  const [focusTimeoutId, setFocusTimeoutId] = useState<number>();

  const [scrollIndex, setScrollIndex] = useState<number>(0);

  const [isVirtual, setIsVirtual] = useState<boolean>(virtualizeOptions); // TODO: Update if the scroller div is smaller than the max-height

  useEffect(() => {
    setIsVirtual(virtualizeOptions);
  }, [virtualizeOptions]);

  // Merge the default styled container prop and the placeholderProps object to get user styles
  const placeholderMergedProps = {
    StyledContainer: PlaceholderContainer,
    ...placeholderProps,
  };

  const tagContainerItemProps = valueItemTagProps.containerProps || {};

  const optionsHash: { [key: string]: OptionProps } = useMemo(() => {
    const hash: { [key: string]: OptionProps } = {};
    options.forEach(option => {
      hash[option.id] = { ...option, isSelected: values.includes(option.id) };
    });

    return hash;
  }, [options, values]);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      e.preventDefault();

      setFocusTimeoutId(
        window.setTimeout(() => {
          if (focusWithin) {
            setFocusWithin(false);
            setIsOpen(false);
            if (onBlur) {
              onBlur();
            }
          }
        }, 0),
      );
    },
    [onBlur, focusWithin],
  );

  const handleFocus = useCallback(() => {
    clearTimeout(focusTimeoutId);

    if (!focusWithin) {
      setFocusWithin(true);
    }

    setIsOpen(true);

    window.setTimeout(() => {
      const focusedElement = document.activeElement;

      if (focusedElement && focusedElement.id === `${name}-dropdown-button`) {
        const button = focusedElement.parentNode as HTMLElement | undefined;
        const optionsContainer = button ? button.nextElementSibling : null;

        if (optionsContainer) {
          if (isVirtual) {
            const virtuosoOuterContainer = optionsContainer.firstElementChild;
            const virtuosoInnerContainer = virtuosoOuterContainer?.firstElementChild;
            const virtuosoScroller = virtuosoInnerContainer?.firstElementChild;
            if (virtuosoScroller && virtuosoScroller.clientHeight < optionsContainer.clientHeight) {
              setIsVirtual(false);
            }
          } else if (
            virtualizeOptions &&
            optionsContainer.scrollHeight > optionsContainer.clientHeight
          ) {
            setIsVirtual(true);
          }
        }
      }
    }, 0);

    if (onFocus) {
      onFocus();
    }
  }, [focusTimeoutId, focusWithin, onFocus, name, isVirtual, virtualizeOptions]);

  const handleSelect = useCallback(
    (clickedId: string | number) => {
      if (!multi) {
        setIsOpen(false);
        onSelect([clickedId]);
      } else {
        const previouslySelected = optionsHash[clickedId].isSelected;
        const newValues = previouslySelected
          ? values.filter(val => val !== clickedId)
          : [...values, clickedId];
        onSelect(newValues);
      }
    },
    [onSelect, multi, values, optionsHash],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      onSelect(multi ? [] : undefined);
      if (onClear) {
        onClear();
      }
    },
    [multi, onClear, onSelect],
  );

  const handleMouseDownOnButton = useCallback(
    (e: React.MouseEvent) => {
      if (isOpen) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - It's okay if target is null in this case as we want it to close regardless
        handleBlur(e);
      } else {
        handleFocus();
      }
    },
    [isOpen, handleBlur, handleFocus],
  );

  const keyDownHandler = useCallback(
    ({ key }) => {
      // setTimeout(0) needed when responding to key events to push back call
      // to activeElement to after it is updated in the DOM
      window.setTimeout(() => {
        const focusedElement = document.activeElement;

        if (isVirtual) {
          switch (key) {
            case 'Enter':
              const match = focusedElement && focusedElement.id.match(`${name}-option-(.*)`);
              if (match) {
                handleSelect(match[1]);
              }
              break;
            case 'ArrowUp':
              if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
                const row = focusedElement.parentNode as HTMLElement | undefined;
                const rowPrevSibling = row ? row.previousElementSibling : null;
                if (rowPrevSibling) {
                  const prevOption = rowPrevSibling.firstElementChild as HTMLElement | undefined;
                  if (prevOption) {
                    prevOption.focus();
                  }
                }
              }
              break;
            case 'ArrowDown':
              if (focusedElement && focusedElement.id === `${name}-dropdown-button`) {
                const button = focusedElement.parentNode as HTMLElement | undefined;
                // get parent before nextElementSibling because buttons are nested inside of skeletons
                const optionsContainer = button ? button.nextElementSibling : null;
                if (optionsContainer) {
                  const virtuosoOuterContainer = optionsContainer.firstElementChild;
                  const virtuosoInnerContainer = virtuosoOuterContainer?.firstElementChild;
                  const virtuosoScroller = virtuosoInnerContainer?.firstElementChild;
                  const firstOption = virtuosoScroller?.firstElementChild as
                    | HTMLElement
                    | undefined;
                  if (firstOption) {
                    firstOption.focus();
                  }
                }
              } else if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
                const row = focusedElement.parentNode as HTMLElement | undefined;
                const rowNextSibling = row ? row.nextElementSibling : null;
                if (rowNextSibling) {
                  const nextOption = rowNextSibling.firstElementChild as HTMLElement | undefined;
                  if (nextOption) {
                    nextOption.focus();
                  }
                }
              }
              break;
            default:
              break;
          }
        } else {
          switch (key) {
            case 'Enter':
              const match = focusedElement && focusedElement.id.match(`${name}-option-(.*)`);
              if (match) {
                handleSelect(match[1]);
              }
              break;
            case 'ArrowUp':
              if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
                const sibling = focusedElement.previousElementSibling as HTMLElement | null;
                if (sibling) {
                  sibling.focus();
                }
              }
              break;
            case 'ArrowDown':
              if (focusedElement && focusedElement.id === `${name}-dropdown-button`) {
                const button = focusedElement.parentNode as HTMLElement | undefined;
                // get parent before nextElementSibling because buttons are nested inside of skeletons
                const optionsContainer = button ? button.nextElementSibling : null;
                if (optionsContainer) {
                  const firstOption = optionsContainer.firstElementChild as HTMLElement | undefined;
                  if (firstOption) {
                    firstOption.focus();
                  }
                }
              } else if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
                const sibling = focusedElement.nextElementSibling as HTMLElement | null;
                if (sibling) {
                  sibling.focus();
                }
              }
              break;
            default:
              break;
          }
        }
      }, 0);
    },
    [handleSelect, isVirtual, name],
  );

  useEffect(() => {
    window.removeEventListener('keydown', keyDownHandler);
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);

  const closeIcons = (
    <>
      {onClear && values.length > 0 && (
        <StyledCloseIconContainer
          onClick={handleClear}
          onFocus={(e: React.FocusEvent) => e.stopPropagation()}
          tabIndex={tabIndex}
          ref={closeIconRef}
          {...closeIconProps}
        >
          <Icon path={mdiClose} size="1em" />
        </StyledCloseIconContainer>
      )}
      <StyledArrowIconContainer ref={arrowIconRef} {...arrowIconProps}>
        <Icon path={isOpen ? mdiMenuUp : mdiMenuDown} size="1.25em" />
      </StyledArrowIconContainer>
    </>
  );

  const VirtuosoComponents = useMemo(
    () => ({
      Scroller: React.forwardRef(({ children }: { children: React.ReactNode }, listRef) => (
        <StyledOptionsContainer
          color={defaultedColor}
          variant={optionsVariant}
          isVirtual={isVirtual}
          role="listbox"
          ref={mergeRefs([
            optionsContainerRef,
            optionsContainerInternalRef,
            listRef as React.RefObject<HTMLDivElement>,
          ])}
          {...optionsContainerProps}
        >
          {children}
        </StyledOptionsContainer>
      )),
    }),
    [defaultedColor, optionsContainerProps, optionsContainerRef, optionsVariant, isVirtual],
  );

  return (
    <StyledContainer
      id={`${name}-container`}
      elevation={elevation}
      isOpen={isOpen}
      onBlur={handleBlur}
      onFocus={handleFocus}
      name={name}
      aria-label={placeholder}
      ref={mergeRefs([containerRef, containerInternalRef])}
      {...containerProps}
    >
      <Button
        StyledContainer={StyledValueContainer}
        id={`${name}-dropdown-button`}
        color={defaultedColor}
        onMouseDown={handleMouseDownOnButton}
        variant={variant}
        containerRef={valueContainerRef}
        {...valueContainerProps}
        containerProps={{
          isOpen,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ...(valueContainerProps ? valueContainerProps.containerProps : {}),
        }}
      >
        <StyledValueItem id={`${name}-value-item`} ref={valueItemRef} {...valueItemProps}>
          {values
            .filter(val => val !== undefined && optionsHash[val] !== undefined)
            .map((val, i, arr) =>
              optionsHash[val] !== undefined ? (
                <Tag
                  StyledContainer={StyledTagContainer}
                  variant={valueVariant}
                  {...valueItemTagProps}
                  containerProps={{
                    dropdownVariant: variant,
                    tagVariant: valueVariant,
                    dropdownColor: defaultedColor,
                    transparentColor: colors.transparent,
                    ...tagContainerItemProps,
                  }}
                  key={val}
                >
                  {optionsHash[val].optionValue}
                  {valueVariant === variants.text && i !== arr.length - 1 && ','}
                </Tag>
              ) : undefined,
            )}
          {(!values || !values.length) && (
            <StyledPlaceholder
              ref={placeholderRef}
              id={`${name}-placeholder`}
              {...placeholderMergedProps}
            >
              {placeholder}
            </StyledPlaceholder>
          )}
        </StyledValueItem>
        {closeIcons}
      </Button>
      {isOpen &&
        (isVirtual ? (
          <Virtuoso
            data={options}
            rangeChanged={(range: ListRange) => setScrollIndex(range.startIndex)}
            initialTopMostItemIndex={
              rememberScrollPosition && scrollIndex < options.length ? scrollIndex : 0
            }
            initialItemCount={
              typeof window !== 'undefined' && window.document && window.document.createElement
                ? undefined
                : options.length
            }
            components={VirtuosoComponents as Components}
            itemContent={(_index, option) => (
              <StyledOptionItem
                id={`${name}-option-${option.id}`}
                key={`${name}-option-${option.id}`}
                onClick={() => handleSelect(option.id)}
                tabIndex={-1}
                color={defaultedColor}
                variant={optionsVariant}
                multi={multi}
                selected={optionsHash[option.id].isSelected}
                ref={optionItemRef}
                role="option"
                {...optionItemProps}
              >
                {multi && (
                  <StyledCheckContainer
                    color={defaultedColor}
                    selected={optionsHash[option.id].isSelected}
                    variant={optionsVariant}
                    multi={multi}
                    ref={checkContainerRef}
                    {...checkContainerProps}
                  >
                    {optionsHash[option.id].isSelected && <Icon path={mdiCheck} size="1em" />}
                  </StyledCheckContainer>
                )}
                <Span>{option.optionValue}</Span>
              </StyledOptionItem>
            )}
          />
        ) : (
          <StyledOptionsContainer
            color={defaultedColor}
            variant={optionsVariant}
            isVirtual={isVirtual}
            role="listbox"
            ref={mergeRefs([optionsContainerRef, optionsContainerInternalRef])}
            {...optionsContainerProps}
          >
            {options.map(option => (
              <StyledOptionItem
                id={`${name}-option-${option.id}`}
                key={`${name}-option-${option.id}`}
                onClick={() => handleSelect(option.id)}
                tabIndex={-1}
                color={defaultedColor}
                variant={optionsVariant}
                multi={multi}
                selected={optionsHash[option.id].isSelected}
                ref={optionItemRef}
                role="option"
                {...optionItemProps}
              >
                {multi && (
                  <StyledCheckContainer
                    color={defaultedColor}
                    selected={optionsHash[option.id].isSelected}
                    variant={optionsVariant}
                    multi={multi}
                    ref={checkContainerRef}
                    {...checkContainerProps}
                  >
                    {optionsHash[option.id].isSelected && <Icon path={mdiCheck} size="1em" />}
                  </StyledCheckContainer>
                )}
                <Span>{option.optionValue}</Span>
              </StyledOptionItem>
            ))}
          </StyledOptionsContainer>
        ))}
    </StyledContainer>
  );
};

Dropdown.Container = Container;
Dropdown.OptionsContainer = OptionsContainer;
Dropdown.OptionItem = OptionItem;
Dropdown.ValueContainer = ValueContainer;
Dropdown.ValueItem = ValueItem;
Dropdown.Placeholder = PlaceholderContainer;

export default Dropdown;
