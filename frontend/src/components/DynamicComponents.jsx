import React, { memo } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import MatplotlibWidget from '@/components/widgets/MatplotlibWidget';

import { cn } from '@/lib/utils';
import { comm } from '@/utils/websocket';

// Import all widgets
import AlertWidget from './widgets/AlertWidget';
import ButtonWidget from './widgets/ButtonWidget';
import ChatWidget from './widgets/ChatWidget';
import CheckboxWidget from './widgets/CheckboxWidget';
import ConnectionInterfaceWidget from './widgets/ConnectionInterfaceWidget';
import DAGVisualizationWidget from './widgets/DAGVisualizationWidget';
import DataVisualizationWidget from './widgets/DataVisualizationWidget';
import FastplotlibWidget from './widgets/FastplotlibWidget';
import ImageWidget from './widgets/ImageWidget';
import MarkdownRendererWidget from './widgets/MarkdownRendererWidget';
import ProgressWidget from './widgets/ProgressWidget';
import SelectboxWidget from './widgets/SelectboxWidget';
import SidebarWidget from './widgets/SidebarWidget';
import SliderWidget from './widgets/SliderWidget';
import SpinnerWidget from './widgets/SpinnerWidget';
import TableViewerWidget from './widgets/TableViewerWidget';
import TextInputWidget from './widgets/TextInputWidget';
import TopbarWidget from './widgets/TopbarWidget';
import UnknownWidget from './widgets/UnknownWidget';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DynamicComponents] Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            {this.state.error?.message || 'Error rendering component'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Memoized component wrapper
const MemoizedComponent = memo(
  ({
    component,
    index,
    handleUpdate,
    sidebarOpen,
    setSidebarOpen,
    isCollapsed,
    setIsCollapsed,
  }) => {
    const componentId = component.id || `component-${index}`;
    const commonProps = {
      key: componentId,
      id: componentId,
      ...component,
    };

    switch (component.type) {
      case 'sidebar':
        return <SidebarWidget defaultOpen={component.defaultopen} />;

      case 'button':
        return (
          <ButtonWidget
            {...commonProps}
            label={component.label || 'Button'}
            variant={component.variant || 'outline'}
            size={component.size || 'default'}
            disabled={component.disabled || false}
            loading={component.loading || false}
            onClick={() => handleUpdate(componentId, true)}
            className={component.className}
          />
        );

      case 'matplotlib':
        return <MatplotlibWidget {...commonProps} image={component.image} />;

      case 'slider':
        return (
          <SliderWidget
            {...commonProps}
            label={component.label || 'Slider'}
            min={component.min || 0}
            max={component.max || 100}
            step={component.step || 1}
            value={component.value !== undefined ? component.value : 50}
            onChange={(value) => handleUpdate(componentId, value)}
            disabled={component.disabled}
            showValue={component.showValue !== undefined ? component.showValue : true}
            showMinMax={component.showMinMax !== undefined ? component.showMinMax : true}
            variant={component.variant || 'default'}
            className={component.className}
          />
        );

      case 'text_input':
        return (
          <TextInputWidget
            {...commonProps}
            label={component.label}
            placeholder={component.placeholder}
            value={component.value || ''}
            onChange={(value) => handleUpdate(componentId, value)}
            error={component.error}
            disabled={component.disabled}
            required={component.required}
            type={component.type || 'text'}
            size={component.size || 'default'}
            variant={component.variant || 'default'}
            className={component.className}
          />
        );

      case 'topbar':
        return <TopbarWidget {...commonProps} />;

      case 'checkbox':
        return (
          <CheckboxWidget
            {...commonProps}
            label={component.label || 'Checkbox'}
            checked={!!component.value}
            description={component.description}
            disabled={component.disabled}
            onChange={(value) => handleUpdate(componentId, value)}
          />
        );

      case 'selectbox':
        return (
          <SelectboxWidget
            {...commonProps}
            label={component.label}
            options={component.options || []}
            value={component.value || (component.options && component.options[0]) || ''}
            onChange={(value) => handleUpdate(componentId, value)}
            placeholder={component.placeholder}
            disabled={component.disabled}
            error={component.error}
            required={component.required}
            size={component.size || 'default'}
            className={component.className}
          />
        );

      case 'progress':
        return (
          <ProgressWidget
            {...commonProps}
            label={component.label || 'Progress'}
            value={component.value !== undefined ? component.value : 0}
            steps={component.steps}
            showValue={component.showValue !== undefined ? component.showValue : true}
            size={component.size || 'default'}
            className={component.className}
          />
        );

      case 'spinner':
        return (
          <SpinnerWidget
            {...commonProps}
            label={component.label || 'Loading...'}
            size={component.size || 'default'}
            variant={component.variant || 'default'}
            showLabel={component.showLabel !== undefined ? component.showLabel : true}
            className={component.className}
          />
        );

      case 'alert':
        return (
          <AlertWidget
            {...commonProps}
            level={component.level || 'info'}
            message={component.message || component.content || ''}
          />
        );

      case 'image':
        return (
          <ImageWidget
            {...commonProps}
            src={component.src}
            alt={component.alt || ''}
            size={component.size || 'medium'}
            rounded={component.rounded !== undefined ? component.rounded : true}
            withCard={component.withCard}
            aspectRatio={component.aspectRatio || 1}
            objectFit={component.objectFit || 'cover'}
          />
        );

      case 'text':
        return (
          <MarkdownRendererWidget
            {...commonProps}
            markdown={component.markdown || component.content || component.value || ''}
            error={component.error}
            variant={component.variant || 'default'}
            className={component.className}
          />
        );

      case 'chat':
        return (
          <ChatWidget
            {...commonProps}
            sourceId={component.config?.source || null}
            sourceData={component.config?.data || null}
            value={component.value || component.state || { messages: [] }}
            onChange={(value) => {
              handleUpdate(componentId, value);
            }}
            className={component.className}
          />
        );

      case 'table':
        return (
          <TableViewerWidget
            {...commonProps}
            rowData={component.data || []}
            title={component.title || 'Table Viewer'}
            variant={component.variant || 'default'}
            showTitle={component.showTitle ?? true}
            striped={component.striped ?? true}
            dense={component.dense ?? false}
            hoverable={component.hoverable ?? true}
            className={component.className}
          />
        );

      case 'connection':
        return (
          <ConnectionInterfaceWidget
            {...commonProps}
            disabled={component.disabled}
            onConnect={(connectionData) => handleUpdate(componentId, connectionData)}
          />
        );

      case 'plot':
        return (
          <DataVisualizationWidget
            {...commonProps}
            data={component.data || {}}
            layout={component.layout || {}}
            config={component.config || {}}
          />
        );

      case 'dag':
        return <DAGVisualizationWidget {...commonProps} data={component.data || {}} />;

      // Add Fastplotlib component
      case 'fastplotlib_component':
        const { className, data, config, label, src } = component;
        return (
          <FastplotlibWidget
            {...commonProps}
            data={component.data}
            config={component.config}
            src={src}
            label={label}
            className={className}
            clientId={comm.clientId}
          />
        );

      default:
        console.warn(`[DynamicComponents] Unknown component type: ${component.type}`);
        return (
          <UnknownWidget
            {...commonProps}
            type={component.type || 'unknown'}
            variant={component.variant || 'default'}
            className={component.className}
          />
        );
    }
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memoization
    return (
      prevProps.component.id === nextProps.component.id &&
      prevProps.component.value === nextProps.component.value &&
      prevProps.component.error === nextProps.component.error &&
      prevProps.index === nextProps.index
    );
  }
);

const DynamicComponents = ({ components, onComponentUpdate }) => {
  console.log('[DynamicComponents] Rendering with components:', components);

  if (!components?.rows) {
    console.warn('[DynamicComponents] No components or invalid structure received');
    return null;
  }

  const handleUpdate = (componentId, value) => {
    console.log(`[DynamicComponents] Component update triggered:`, {
      componentId,
      value,
      timestamp: new Date().toISOString(),
    });
    onComponentUpdate(componentId, value);
  };

  const renderRow = (row, rowIndex) => {
    if (!Array.isArray(row)) {
      console.warn(`[DynamicComponents] Invalid row at index ${rowIndex}`);
      return null;
    }

    return (
      <div key={`row-${rowIndex}`} className="dynamiccomponent-row">
        {row.map((component, index) => {
          if (!component) return null;

          return (
            <>
              <div
                key={component.id || `component-${index}`}
                className={cn(
                  'dynamiccomponent-component',
                  component.type === 'separator' && 'dynamiccomponent-hidden'
                )}
                style={{ flex: component.flex || 1 }}
              >
                <ErrorBoundary>
                  <MemoizedComponent
                    component={component}
                    index={index}
                    handleUpdate={handleUpdate}
                  />
                </ErrorBoundary>
              </div>
              {index < row.length - 1 && <div className="dynamiccomponent-separator" />}
            </>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dynamiccomponent-container">
      {components.rows.map((row, index) => renderRow(row, index))}
    </div>
  );
};

export default memo(DynamicComponents);
