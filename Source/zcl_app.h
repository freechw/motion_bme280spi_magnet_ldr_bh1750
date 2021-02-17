#ifndef ZCL_APP_H
#define ZCL_APP_H

#ifdef __cplusplus
extern "C" {
#endif

/*********************************************************************
 * INCLUDES
 */
#include "version.h"
#include "zcl.h"


/*********************************************************************
 * CONSTANTS
 */

// Application Events
#define APP_REPORT_EVT                  0x0001
#define APP_READ_SENSORS_EVT            0x0002
#define APP_REPORT_MEASURE_EVT          0x0004
#define APP_MOTION_ON_EVT               0x0008
#define APP_MOTION_OFF_EVT              0x0020
#define APP_MOTION_DELAY_EVT            0x0040
#define APP_SAVE_ATTRS_EVT              0x0080
#define APP_CONTACT_DELAY_EVT           0x0100
#define APP_BH1750_DELAY_EVT            0x0200


#define AIR_COMPENSATION_FORMULA(ADC)   ((0.179 * (double)ADC + 3926.0))
#define WATER_COMPENSATION_FORMULA(ADC) ((0.146 * (double)ADC + 2020.0))



#define APP_REPORT_DELAY ((uint32) 1800000) //30 minutes
//#define APP_REPORT_DELAY ((uint32) 60000) // 60 sec

/*********************************************************************
 * MACROS
 */
#define NW_APP_CONFIG 0x0401

#define R           ACCESS_CONTROL_READ
#define RR          (R | ACCESS_REPORTABLE)
#define RW          (ACCESS_CONTROL_READ | ACCESS_CONTROL_WRITE | ACCESS_CONTROL_AUTH_WRITE)

#define BASIC       ZCL_CLUSTER_ID_GEN_BASIC
#define ONOFF       ZCL_CLUSTER_ID_GEN_ON_OFF
#define POWER_CFG   ZCL_CLUSTER_ID_GEN_POWER_CFG
#define TEMP        ZCL_CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT
#define HUMIDITY    ZCL_CLUSTER_ID_MS_RELATIVE_HUMIDITY
#define SOIL_HUMIDITY                  0x0408
#define PRESSURE    ZCL_CLUSTER_ID_MS_PRESSURE_MEASUREMENT
#define ILLUMINANCE ZCL_CLUSTER_ID_MS_ILLUMINANCE_MEASUREMENT
#define OCCUPANCY   ZCL_CLUSTER_ID_MS_OCCUPANCY_SENSING

#define ZCL_BOOLEAN   ZCL_DATATYPE_BOOLEAN
#define ZCL_UINT8   ZCL_DATATYPE_UINT8
#define ZCL_UINT16  ZCL_DATATYPE_UINT16
#define ZCL_UINT32  ZCL_DATATYPE_UINT32
#define ZCL_INT16   ZCL_DATATYPE_INT16
#define ZCL_INT8    ZCL_DATATYPE_INT8
#define ZCL_BITMAP8 ZCL_DATATYPE_BITMAP8
#define ZCL_ENUM8   ZCL_DATATYPE_ENUM8


#define ATTRID_MS_RELATIVE_HUMIDITY_MEASURED_VALUE_RAW_ADC              0x0200
#define ATTRID_MS_RELATIVE_HUMIDITY_MEASURED_VALUE_BATTERY_RAW_ADC      0x0201



/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * VARIABLES
 */

extern SimpleDescriptionFormat_t zclApp_FirstEP;
extern SimpleDescriptionFormat_t zclApp_SecondEP;
extern SimpleDescriptionFormat_t zclApp_ThirdEP;
extern SimpleDescriptionFormat_t zclApp_FourthEP;

extern uint8 zclApp_BatteryVoltage;
extern uint8 zclApp_BatteryPercentageRemainig;
extern uint16 zclApp_BatteryVoltageRawAdc;
extern int16 zclApp_Temperature_Sensor_MeasuredValue;
extern int16 zclApp_PressureSensor_MeasuredValue;
extern int16 zclApp_PressureSensor_ScaledValue;
extern int8 zclApp_PressureSensor_Scale;
extern uint16 zclApp_HumiditySensor_MeasuredValue;
extern int16 zclApp_DS18B20_MeasuredValue;
extern uint16 zclApp_SoilHumiditySensor_MeasuredValue;
extern uint16 zclApp_SoilHumiditySensor_MeasuredValueRawAdc;
extern uint16 zclApp_IlluminanceSensor_MeasuredValue;
extern uint16 zclApp_IlluminanceSensor_MeasuredValueRawAdc;
extern uint16 zclApp_bh1750IlluminanceSensor_MeasuredValue;

extern uint8 zclApp_Magnet_OnOff;
// Occupancy Cluster 
extern uint8 zclApp_Occupied; 
extern uint8 zclApp_OccType; 
//extern uint16 zclApp_PirOccupiedToUnoccupiedDelay; 
//extern uint16 zclApp_PirUnoccupiedToOccupiedDelay;
typedef struct
{
    uint16 PirOccupiedToUnoccupiedDelay;
    uint16 PirUnoccupiedToOccupiedDelay;
}  application_config_t;

extern application_config_t zclApp_Config;

// attribute list
extern CONST zclAttrRec_t zclApp_AttrsFirstEP[];
extern CONST zclAttrRec_t zclApp_AttrsSecondEP[];
extern CONST zclAttrRec_t zclApp_AttrsThirdEP[];
extern CONST zclAttrRec_t zclApp_AttrsFourthEP[];

extern CONST uint8 zclApp_AttrsSecondEPCount;
extern CONST uint8 zclApp_AttrsFirstEPCount;
extern CONST uint8 zclApp_AttrsThirdEPCount;
extern CONST uint8 zclApp_AttrsFourthEPCount;

extern const uint8 zclApp_ManufacturerName[];
extern const uint8 zclApp_ModelId[];
extern const uint8 zclApp_PowerSource;

// APP_TODO: Declare application specific attributes here

/*********************************************************************
 * FUNCTIONS
 */

/*
 * Initialization for the task
 */
extern void zclApp_Init(byte task_id);

/*
 *  Event Process for the task
 */
extern UINT16 zclApp_event_loop(byte task_id, UINT16 events);

void user_delay_ms(uint32_t period);

extern void zclApp_ResetAttributesToDefaultValues(void);

#ifdef __cplusplus
}
#endif

#endif /* ZCL_APP_H */
