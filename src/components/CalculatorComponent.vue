<template>
  <v-container class="pa-0">
    <v-row>
      <v-col cols='12'>
        <v-form v-model='valid'>
          <v-container>
            <v-row>
              <v-col cols='12'>
                <v-radio-group inline v-model='state.energyConsumptionInterval' density='comfortable' label='Power consumption interval'>
                  <v-radio class='flex-grow-1' v-for='(item, index) in lookups.energyConsumptionIntervals'
                           :key='index'
                           :label='item.text'
                           :value='item.key'></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols='12'>
                <v-text-field clearable v-model='state.energyConsumption'
                              :label="`${state.energyConsumptionInterval} power consumption`"
                              :suffix='state.energyConsumptionUnitOfMeasure'></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class='d-none'>
              <v-col>
                <v-radio-group
                    v-model='state.energyConsumptionUnitOfMeasure'
                    inline density='comfortable'>
                  <v-radio class='flex-grow-1' v-for='(item, index) in lookups.energyConsumptionUnitOfMeasure'
                           :key='index'
                           :label='item.text'
                           :value='item.key'></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols='6'>
                <v-select label='Battery type' :items='lookups.batteryTypes'
                          v-model='state.batteryType'></v-select>
              </v-col>
              <v-col cols='6'>
                <v-select label='Battery voltage' :items='lookups.batteryVoltages' suffix='volts'
                          v-model='state.batteryVoltage'></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols='12'>
                <v-btn @click="() => state.advancedMode = !state.advancedMode" color="blue-lighten-4">
                  <template v-if="state.advancedMode">Simple Mode</template>
                  <template v-else>Advanced Mode</template>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="state.advancedMode">
              <v-col cols='12' sm='4'>
                <v-text-field label='Average daily sun-hours' type='number' v-model='state.sunHours'
                              suffix='Hours'></v-text-field>
              </v-col>
              <v-col cols='6' sm='4'>
                <v-text-field label='Inverter efficiency' type='number' v-model='state.inverterEfficiencyPercentage'
                              suffix='%'></v-text-field>
              </v-col>
              <v-col cols='6' sm='4'>
                <v-text-field label='Solar panel efficiency' type='number'
                              v-model='state.solarPanelEfficiencyPercentage'
                              suffix='%'></v-text-field>
              </v-col>
            </v-row>
            <v-row dense v-if="state.advancedMode">
              <v-col>
                <v-checkbox v-model='state.shouldRoundUp' density='compact'
                            label='Round up the results'
                            persistent-hint
                            hint='This allows to provide a buffer and simplify the result'></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-col>
      <v-col cols='12' v-if="shouldShowResults">
        <v-container>
          <v-row>
            <v-col cols='12'>
              <v-card title='Solar Panel Recommendation'>
                <template v-slot:text>
                  You will need at least <strong>{{ minimumSolarPanelWatt }} watts</strong> of solar panels.
                </template>
              </v-card>
            </v-col>
            <v-col cols='12'>
              <v-card>
                <template v-slot:title>
                  Battery Recommendation
                </template>
                <template v-slot:text>
                  You will need a battery with <strong>{{ state.batteryVoltage }} volts</strong> with
                  capacity of at least <strong>{{ minimumBatteryAmpereHour }} Ampere hour</strong>.
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import {computed, onMounted, reactive, watch} from 'vue'

const lookups = {
  batteryTypes: ['LiFePo4', 'Lead Acid']
  , batteryVoltages: [12, 24, 48]
  , presetBatteryDepthOfDischargePercentage: {'Lead Acid': 50, 'LiFePo4': 80}
  , energyConsumptionUnitOfMeasure: [{key: 'kWh', text: 'kilowatt-hour'}, {key: 'Wh', text: 'watt-hour'}]
  , energyConsumptionIntervals: [{key: 'Daily', text: 'Daily'}, {key: 'Monthly', text: 'Monthly'}]
}

const state = reactive({
  batteryType: '',
  batteryVoltage: 0,
  energyConsumptionUnitOfMeasure: '',
  energyConsumptionInterval: '',
  depthOfDischargePercentage: 0,
  inverterEfficiencyPercentage: 0,
  solarPanelEfficiencyPercentage: 0,
  sunHours: 0,
  roundUpToNearestHundred: 0,
  energyConsumption: null,
  energyConsumptionWattHour: 0,
  targetRoundUp: 0,

  batteryUsableCapacityWattHour: 0,
  batteryMaxCapacityWattHour: 0,
  minimumSolarPanelWatt: 0,

  advancedMode: false,
})

onMounted(() => {
  state.batteryVoltage = lookups.batteryVoltages[2]
  state.batteryType = lookups.batteryTypes[0]
  state.inverterEfficiencyPercentage = 90
  state.solarPanelEfficiencyPercentage = 80
  state.sunHours = 4
  state.shouldRoundUp = true
  state.energyConsumptionUnitOfMeasure = lookups.energyConsumptionUnitOfMeasure[0].key
  state.energyConsumptionInterval = lookups.energyConsumptionIntervals[0].key
})

watch(() => state.energyConsumptionInterval, () => {
  state.energyConsumption = null
})

const getValueByPercentage = (input, percent) => input * percent / 100
const roundUp = (value, roundUpNearestValue) => {
  if (roundUpNearestValue)
    return Math.ceil(value / roundUpNearestValue) * roundUpNearestValue

  if (value < 500) return roundUp(value, 10)
  else if (value < 1000) return roundUp(value, 50)
  else return roundUp(value, 100)
}

const removeDecimal = value => Math.round(value)

const resolveRounding = (value, roundUpNearestValue) =>
    state.shouldRoundUp ? roundUp(value, roundUpNearestValue) : removeDecimal(value)

const depthOfDischargePercentage = computed(() => lookups.presetBatteryDepthOfDischargePercentage[state.batteryType])

const energyConsumptionWattHour = computed(() => {
  const DAYS_PER_MONTH = 30

  const value = state.energyConsumption * (state.energyConsumptionUnitOfMeasure === 'kWh' ? 1000 : 1);

  if (state.energyConsumptionInterval === 'Daily')
    return value;

  return value / DAYS_PER_MONTH
});

const valid = computed(() => {
  return false
})
const energyConsumptionWithInverter = computed(() =>
    resolveRounding(getValueByPercentage(energyConsumptionWattHour.value, 200 - state.inverterEfficiencyPercentage)))

const minimumBatteryAmpereHour = computed(() => resolveRounding(energyConsumptionWithInverter.value
    / getValueByPercentage(state.batteryVoltage, depthOfDischargePercentage.value)))

const batteryMaxCapacityWattHour = computed(() => state.batteryVoltage * minimumBatteryAmpereHour.value)

const batteryUsableCapacityWattHour = computed(() => getValueByPercentage(batteryMaxCapacityWattHour.value, depthOfDischargePercentage.value))

const minimumSolarPanelWatt = computed(() => resolveRounding(getValueByPercentage(batteryUsableCapacityWattHour.value / state.sunHours, 200 - state.solarPanelEfficiencyPercentage)))

const shouldShowResults = computed(() => !Number.isNaN(state.energyConsumption) && state.energyConsumption > 0)
</script>
